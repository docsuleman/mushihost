import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getStripe } from '../_shared/stripe.ts';

const SUPABASE_URL = resolveSupabaseUrl();

/**
 * mushi-auto-load v2
 *
 * Integrates with MyQBank's daily_subscription_management cron.
 * Runs before the cron deactivates subscriptions for insufficient credits.
 *
 * Two modes per customer:
 *  - "package": User picks a specific credit pack (voucher). On expiry day,
 *    if credits can't cover upcoming renewals, charge for that pack.
 *  - "minimum_balance": Keep credits above a threshold. If after renewals
 *    credits would drop below threshold, load enough credits to stay above.
 *
 * Flow:
 *  1. Find auto-load-enabled customers
 *  2. For each, query upcoming Subscription expiries (within 2 days)
 *  3. Calculate total credits needed for those renewals
 *  4. Determine if auto-load should fire based on mode
 *  5. Find the best product (credit pack) to purchase
 *  6. Charge off-session (automatic) or send notification (notify)
 *  7. Add credits, log result
 */

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all customers with auto-load enabled
    const { data: customers, error } = await supabaseAdmin
      .from('mushi_customers')
      .select('*')
      .eq('auto_load_enabled', true)
      .not('supabase_user_id', 'is', null);

    if (error || !customers) {
      return errorResponse('Failed to fetch auto-load customers', 500);
    }

    // Pre-fetch all active MyQBank credit pack products (sorted by price ascending)
    const { data: creditProducts } = await supabaseAdmin
      .from('mushi_products')
      .select('*')
      .eq('site', 'myqbank')
      .eq('type', 'credit_pack')
      .eq('is_active', true)
      .order('price_usd', { ascending: true });

    if (!creditProducts || creditProducts.length === 0) {
      return errorResponse('No active credit pack products found', 500);
    }

    const results: Array<{ email: string; status: string; details?: string }> = [];
    const today = new Date();
    // Check subscriptions expiring within the next 2 days
    const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const twoDaysStr = twoDaysFromNow.toISOString().split('T')[0];

    for (const customer of customers) {
      try {
        const userId = customer.supabase_user_id as string;

        // Get current credit balance
        const { data: creditRow } = await supabaseAdmin
          .from('Credits')
          .select('Credit')
          .eq('id_Users', userId)
          .single();

        const currentCredits = creditRow?.Credit || 0;

        // Get active subscriptions expiring within 2 days for this user
        const { data: expiringSubscriptions } = await supabaseAdmin
          .from('Subscriptions')
          .select('id, qbank, credit, expiry, autoRenewal')
          .eq('id_Users', userId)
          .eq('active', 1)
          .eq('autoRenewal', true)
          .gte('expiry', todayStr)
          .lte('expiry', twoDaysStr);

        // Calculate total credits needed for upcoming renewals
        const creditsNeeded = (expiringSubscriptions || []).reduce(
          (sum: number, sub: Record<string, unknown>) => sum + (Number(sub.credit) || 0),
          0
        );

        // If no renewals coming up, also check if currently below threshold (for minimum_balance mode)
        const mode = customer.auto_load_mode || 'package';
        const threshold = customer.auto_load_threshold || 0;
        const maxMonthly = customer.auto_load_max_monthly || 100;
        const alreadySpent = Number(customer.auto_loaded_this_month) || 0;

        let creditsToLoad = 0;
        let reason = '';

        if (mode === 'minimum_balance') {
          // After upcoming renewals, what would balance be?
          const balanceAfterRenewals = currentCredits - creditsNeeded;

          if (balanceAfterRenewals < threshold) {
            // Need to load enough so that after renewals, balance >= threshold
            creditsToLoad = threshold - balanceAfterRenewals;
            reason = `Balance after renewals (${balanceAfterRenewals}) would be below threshold (${threshold})`;
          } else if (currentCredits < threshold && creditsNeeded === 0) {
            // No upcoming renewals but already below threshold
            creditsToLoad = threshold - currentCredits;
            reason = `Current balance (${currentCredits}) below threshold (${threshold})`;
          } else {
            results.push({
              email: customer.email,
              status: 'skipped',
              details: `Balance OK: ${currentCredits} credits, ${creditsNeeded} needed for renewals, threshold ${threshold}`,
            });
            continue;
          }
        } else {
          // Package mode: trigger when credits can't cover upcoming renewals
          if (creditsNeeded > 0 && currentCredits < creditsNeeded) {
            creditsToLoad = creditsNeeded - currentCredits;
            reason = `Insufficient credits (${currentCredits}) for ${creditsNeeded} needed by expiring QBanks`;
          } else if (creditsNeeded > 0) {
            results.push({
              email: customer.email,
              status: 'skipped',
              details: `Credits sufficient: ${currentCredits} >= ${creditsNeeded} needed`,
            });
            continue;
          } else {
            results.push({
              email: customer.email,
              status: 'skipped',
              details: 'No QBank renewals due within 2 days',
            });
            continue;
          }
        }

        // Find the best product to purchase
        const product = findBestProduct(creditProducts, creditsToLoad, customer.auto_load_pack);

        if (!product) {
          results.push({
            email: customer.email,
            status: 'error',
            details: `No suitable credit pack found for ${creditsToLoad} credits needed`,
          });
          continue;
        }

        const productCredits = Number(product.grants?.credits) || 0;
        const productPrice = Number(product.price_usd);

        // Check monthly budget
        if (alreadySpent + productPrice > maxMonthly) {
          results.push({
            email: customer.email,
            status: 'skipped',
            details: `Monthly budget exceeded: $${alreadySpent} spent + $${productPrice} = $${alreadySpent + productPrice} > $${maxMonthly} max`,
          });
          continue;
        }

        console.log(
          `Auto-load for ${customer.email}: mode=${mode}, need=${creditsToLoad}, ` +
          `product="${product.name}" (${productCredits} credits / $${productPrice}), reason: ${reason}`
        );

        if (customer.auto_load_mode === 'automatic') {
          const chargeResult = await chargeOffSession(
            supabaseAdmin,
            customer,
            product,
            currentCredits,
            productCredits
          );
          results.push({ email: customer.email, ...chargeResult });
        } else {
          const notifyResult = await sendAutoLoadNotification(
            supabaseAdmin,
            customer,
            product,
            currentCredits,
            creditsNeeded,
            reason
          );
          results.push({ email: customer.email, ...notifyResult });
        }
      } catch (err) {
        console.error(`Auto-load error for ${customer.email}:`, err);
        results.push({ email: customer.email, status: 'error', details: err.message });
      }
    }

    return jsonResponse({ processed: results.length, results });
  } catch (err) {
    console.error('Error in mushi-auto-load:', err);
    return errorResponse(err.message, 500);
  }
};

/**
 * Find the best credit pack product for the needed credits.
 *
 * If customer has a preferred pack (auto_load_pack), use that if it covers the need.
 * Otherwise, find the cheapest pack that provides at least `creditsNeeded`.
 * More credits = cheaper per credit, so larger packs are better value.
 */
function findBestProduct(
  products: Array<Record<string, unknown>>,
  creditsNeeded: number,
  preferredPack?: string
): Record<string, unknown> | null {
  // If customer chose a specific pack, try to use it
  if (preferredPack) {
    const preferred = products.find(
      (p) => p.name === preferredPack || p.id === preferredPack
    );
    if (preferred) {
      const packCredits = Number((preferred.grants as Record<string, unknown>)?.credits) || 0;
      if (packCredits >= creditsNeeded) {
        return preferred;
      }
      // Preferred pack doesn't cover the need — still use it if it's the only option
      // (user explicitly chose this pack, they may want partial coverage + another load next cycle)
      return preferred;
    }
  }

  // Find the cheapest pack that covers the need
  // Products are already sorted by price ascending
  for (const product of products) {
    const packCredits = Number((product.grants as Record<string, unknown>)?.credits) || 0;
    if (packCredits >= creditsNeeded) {
      return product;
    }
  }

  // If no single pack covers the need, return the largest pack (best value)
  // Products sorted by price asc → last one is the biggest/most expensive
  return products[products.length - 1] || null;
}

async function chargeOffSession(
  supabaseAdmin: ReturnType<typeof createClient>,
  customer: Record<string, unknown>,
  product: Record<string, unknown>,
  currentCredits: number,
  creditsToAdd: number
): Promise<{ status: string; details?: string }> {
  if (!customer.stripe_customer_id || !customer.default_payment_method_id) {
    return { status: 'error', details: 'No saved payment method for automatic charge' };
  }

  // Get the Stripe payment method external ID
  const { data: method } = await supabaseAdmin
    .from('mushi_payment_methods')
    .select('external_id')
    .eq('id', customer.default_payment_method_id as string)
    .single();

  if (!method?.external_id) {
    return { status: 'error', details: 'Payment method not found' };
  }

  const stripe = getStripe();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((product.price_usd as number) * 100),
      currency: 'usd',
      customer: customer.stripe_customer_id as string,
      payment_method: method.external_id,
      off_session: true,
      confirm: true,
      metadata: {
        mushi_customer_id: customer.id as string,
        mushi_product_id: product.id as string,
        source: 'auto_load',
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Add credits
      const { data: creditRow } = await supabaseAdmin
        .from('Credits')
        .select('Credit')
        .eq('id_Users', customer.supabase_user_id as string)
        .single();

      const newBalance = (creditRow?.Credit || 0) + creditsToAdd;
      await supabaseAdmin
        .from('Credits')
        .update({ Credit: newBalance })
        .eq('id_Users', customer.supabase_user_id as string);

      // Record payment
      const { data: payment } = await supabaseAdmin
        .from('mushi_payments')
        .insert({
          customer_id: customer.id,
          payment_method_id: customer.default_payment_method_id,
          amount_usd: product.price_usd,
          currency: 'usd',
          provider: 'stripe',
          provider_payment_id: paymentIntent.id,
          status: 'succeeded',
          product_id: product.id,
          description: `Auto-Load: ${product.name}`,
          fulfilled: true,
          fulfilled_at: new Date().toISOString(),
          fulfillment_data: { credits_added: creditsToAdd },
        })
        .select('id')
        .single();

      // Log auto-load
      await supabaseAdmin.from('mushi_auto_load_log').insert({
        customer_id: customer.id,
        payment_id: payment?.id,
        credits_before: currentCredits,
        credits_after: newBalance,
        amount_charged: product.price_usd,
        status: 'succeeded',
      });

      // Update monthly spend
      await supabaseAdmin
        .from('mushi_customers')
        .update({
          auto_loaded_this_month:
            (Number(customer.auto_loaded_this_month) || 0) + (product.price_usd as number),
        })
        .eq('id', customer.id as string);

      return {
        status: 'charged',
        details: `Added ${creditsToAdd} credits, charged $${product.price_usd}. New balance: ${newBalance}`,
      };
    }

    return { status: 'error', details: `Payment intent status: ${paymentIntent.status}` };
  } catch (err) {
    // Log failed attempt
    await supabaseAdmin.from('mushi_auto_load_log').insert({
      customer_id: customer.id,
      credits_before: currentCredits,
      credits_after: currentCredits,
      amount_charged: product.price_usd,
      status: 'failed',
      failure_reason: err.message,
    });

    return { status: 'error', details: err.message };
  }
}

async function sendAutoLoadNotification(
  supabaseAdmin: ReturnType<typeof createClient>,
  customer: Record<string, unknown>,
  product: Record<string, unknown>,
  currentCredits: number,
  creditsNeeded: number,
  reason: string
): Promise<{ status: string; details?: string }> {
  // Create a pre-filled payment link
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 hours

  await supabaseAdmin.from('mushi_payment_links').insert({
    token,
    customer_id: customer.id,
    product_id: product.id,
    source_site: 'myqbank',
    source_user_id: (customer.supabase_user_id as string) || null,
    amount_usd: product.price_usd,
    context: {
      source: 'auto_load_notification',
      credits_at_time: currentCredits,
      credits_needed: creditsNeeded,
      reason,
    },
    expires_at: expiresAt,
  });

  // Schedule a reminder (the send-reminders function will pick it up)
  await supabaseAdmin.from('mushi_reminders').insert({
    customer_id: customer.id,
    type: 'credit_low',
    scheduled_for: new Date().toISOString(),
    email: customer.email as string,
  });

  const mushihostUrl = Deno.env.get('MUSHIHOST_URL') || 'https://payment.freemedtube.net';
  return {
    status: 'notified',
    details: `Payment link created: ${mushihostUrl}/pay/${token} — ${reason}`,
  };
}

Deno.serve(handler);
