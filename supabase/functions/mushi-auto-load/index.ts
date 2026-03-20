import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getStripe } from '../_shared/stripe.ts';

const SUPABASE_URL = resolveSupabaseUrl();

// Credit pack product mapping
const CREDIT_PACKS: Record<string, { credits: number; name: string }> = {
  '10_credits': { credits: 10, name: '10 Credits' },
  '20_credits': { credits: 20, name: '20 Credits' },
  '100_credits': { credits: 100, name: '100 Credits' },
  '250_credits': { credits: 250, name: '250 Credits' },
};

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

    const results: Array<{ email: string; status: string; details?: string }> = [];

    for (const customer of customers) {
      try {
        // Get current credit balance
        const { data: creditRow } = await supabaseAdmin
          .from('Credits')
          .select('Credit')
          .eq('id_Users', customer.supabase_user_id)
          .single();

        const currentCredits = creditRow?.Credit || 0;

        // Check if below threshold
        if (currentCredits >= (customer.auto_load_threshold || 5)) {
          results.push({ email: customer.email, status: 'skipped', details: `Credits ${currentCredits} >= threshold ${customer.auto_load_threshold}` });
          continue;
        }

        // Check monthly budget
        const packKey = customer.auto_load_pack || '100_credits';
        const pack = CREDIT_PACKS[packKey];
        if (!pack) {
          results.push({ email: customer.email, status: 'error', details: `Unknown pack: ${packKey}` });
          continue;
        }

        // Find the product to get price
        const { data: product } = await supabaseAdmin
          .from('mushi_products')
          .select('*')
          .eq('site', 'myqbank')
          .eq('name', pack.name)
          .eq('is_active', true)
          .single();

        if (!product) {
          results.push({ email: customer.email, status: 'error', details: `Product not found for pack: ${pack.name}` });
          continue;
        }

        const alreadySpent = customer.auto_loaded_this_month || 0;
        const maxMonthly = customer.auto_load_max_monthly || 100;

        if (alreadySpent + product.price_usd > maxMonthly) {
          results.push({ email: customer.email, status: 'skipped', details: `Monthly budget exceeded: $${alreadySpent}/$${maxMonthly}` });
          continue;
        }

        if (customer.auto_load_mode === 'automatic') {
          // Charge saved payment method off-session
          const chargeResult = await chargeOffSession(supabaseAdmin, customer, product, currentCredits, pack.credits);
          results.push({ email: customer.email, ...chargeResult });
        } else {
          // Notify mode: create a pre-filled payment link and send email
          const notifyResult = await sendAutoLoadNotification(supabaseAdmin, customer, product, currentCredits);
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
          auto_loaded_this_month: ((customer.auto_loaded_this_month as number) || 0) + (product.price_usd as number),
        })
        .eq('id', customer.id as string);

      return { status: 'charged', details: `Added ${creditsToAdd} credits, charged $${product.price_usd}` };
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
  currentCredits: number
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
    source_user_id: customer.supabase_user_id?.toString(),
    amount_usd: product.price_usd,
    context: { source: 'auto_load_notification', credits_at_time: currentCredits },
    expires_at: expiresAt,
  });

  // Schedule a reminder (the send-reminders function will pick it up)
  await supabaseAdmin.from('mushi_reminders').insert({
    customer_id: customer.id,
    type: 'credit_low',
    scheduled_for: new Date().toISOString(),
    email: customer.email as string,
  });

  const mushihostUrl = Deno.env.get('MUSHIHOST_URL') || 'https://mushihost.com';
  return {
    status: 'notified',
    details: `Payment link created: ${mushihostUrl}/pay/${token}`,
  };
}

Deno.serve(handler);
