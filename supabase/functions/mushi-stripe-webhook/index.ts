import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import Stripe from 'https://esm.sh/stripe@17?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { fulfillPayment } from '../_shared/fulfill.ts';
import { generateInvoice } from '../_shared/invoice.ts';
import { getStripe as getSharedStripe, ensureAutoRenewCoupon, getOrCreateRecurringPrice } from '../_shared/stripe.ts';

const SUPABASE_URL = resolveSupabaseUrl();
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-12-18.acacia',
    });

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return errorResponse('Missing Stripe signature', 400);
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return errorResponse('Invalid signature', 400);
    }

    // Idempotency check
    const { data: existing } = await supabaseAdmin
      .from('mushi_webhook_events')
      .select('id')
      .eq('provider', 'stripe')
      .eq('event_id', event.id)
      .single();

    if (existing) {
      return jsonResponse({ received: true, message: 'Already processed' });
    }

    // Log the event
    await supabaseAdmin.from('mushi_webhook_events').insert({
      provider: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event.data,
      processed: false,
    });

    // Process based on event type
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(supabaseAdmin, event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(supabaseAdmin, event.data.object as Stripe.PaymentIntent);
          break;

        case 'invoice.paid':
          await handleInvoicePaid(supabaseAdmin, event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(supabaseAdmin, event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(supabaseAdmin, event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(supabaseAdmin, event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark as processed
      await supabaseAdmin
        .from('mushi_webhook_events')
        .update({ processed: true })
        .eq('provider', 'stripe')
        .eq('event_id', event.id);
    } catch (processErr) {
      console.error(`Error processing ${event.type}:`, processErr);
      await supabaseAdmin
        .from('mushi_webhook_events')
        .update({ processed: false, error: processErr.message })
        .eq('provider', 'stripe')
        .eq('event_id', event.id);
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return errorResponse(err.message, 500);
  }
};

// ============================================================
// Event Handlers
// ============================================================

async function handlePaymentIntentSucceeded(
  supabaseAdmin: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const metadata = paymentIntent.metadata;
  const linkId = metadata?.mushi_payment_link_id;
  const customerId = metadata?.mushi_customer_id;
  const productId = metadata?.mushi_product_id;

  if (!linkId || !customerId || !productId) {
    console.log('PaymentIntent missing MushiHost metadata, skipping');
    return;
  }

  // Get product and customer
  const { data: product } = await supabaseAdmin
    .from('mushi_products')
    .select('*')
    .eq('id', productId)
    .single();

  const { data: customer } = await supabaseAdmin
    .from('mushi_customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (!product || !customer) {
    console.error('Product or customer not found for payment intent:', paymentIntent.id);
    return;
  }

  // Save payment method if present
  let paymentMethodId: string | null = null;
  if (paymentIntent.payment_method) {
    paymentMethodId = await savePaymentMethod(
      supabaseAdmin,
      customerId,
      paymentIntent.payment_method as string
    );
  }

  // Record payment
  const { data: payment } = await supabaseAdmin
    .from('mushi_payments')
    .insert({
      customer_id: customerId,
      payment_link_id: linkId,
      payment_method_id: paymentMethodId,
      amount_usd: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      provider: 'stripe',
      provider_payment_id: paymentIntent.id,
      status: 'succeeded',
      product_id: productId,
      description: product.public_name || product.name,
    })
    .select('id')
    .single();

  // Mark payment link as completed
  await supabaseAdmin
    .from('mushi_payment_links')
    .update({ status: 'completed' })
    .eq('id', linkId);

  // Calculate period_end for products with an interval (e.g. Gold = 1 year)
  const periodEnd = product.interval
    ? calculatePeriodEnd(product.interval, product.interval_count)
    : null;

  // Fulfill the purchase
  const fulfillResult = await fulfillPayment(
    product,
    customer,
    periodEnd ? { current_period_end: periodEnd.toISOString() } : undefined
  );

  // Update payment with fulfillment status
  if (payment) {
    await supabaseAdmin
      .from('mushi_payments')
      .update({
        fulfilled: fulfillResult.success,
        fulfilled_at: fulfillResult.success ? new Date().toISOString() : null,
        fulfillment_data: fulfillResult.data || null,
        failure_reason: fulfillResult.error || null,
      })
      .eq('id', payment.id);

    // Generate invoice
    await generateInvoice(payment.id, customerId, paymentIntent.amount / 100, product);
  }

  // Load the payment link to check auto_renew flag
  const { data: link } = await supabaseAdmin
    .from('mushi_payment_links')
    .select('auto_renew')
    .eq('id', linkId)
    .single();

  const autoRenew = link?.auto_renew === true;

  if (autoRenew) {
    // Auto-renew ON: Create a Stripe Subscription with 15% coupon for next period
    try {
      const couponId = await ensureAutoRenewCoupon();
      const stripePriceId = await getOrCreateRecurringPrice(product, supabaseAdmin);

      const periodEnd = calculatePeriodEnd(product.interval, product.interval_count);
      const billingAnchor = Math.floor(periodEnd.getTime() / 1000);

      // Attach payment method to customer if not already default
      const stripeInstance = getSharedStripe();
      if (paymentIntent.payment_method) {
        await stripeInstance.paymentMethods.attach(paymentIntent.payment_method as string, {
          customer: customer.stripe_customer_id,
        });
        await stripeInstance.customers.update(customer.stripe_customer_id, {
          invoice_settings: {
            default_payment_method: paymentIntent.payment_method as string,
          },
        });
      }

      const subscription = await stripeInstance.subscriptions.create({
        customer: customer.stripe_customer_id,
        items: [{ price: stripePriceId }],
        coupon: couponId,
        billing_cycle_anchor: billingAnchor,
        proration_behavior: 'none',
        metadata: {
          mushi_customer_id: customerId,
          mushi_product_id: productId,
          auto_renew: 'true',
        },
      });

      await supabaseAdmin.from('mushi_subscriptions').insert({
        customer_id: customerId,
        product_id: productId,
        payment_method_id: paymentMethodId,
        stripe_subscription_id: subscription.id,
        status: 'active',
        auto_renew: true,
        discount_percent: 15,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        granted: product.grants,
      });

      console.log(`Created auto-renew subscription ${subscription.id} for ${customer.email}`);
    } catch (subErr) {
      console.error('Failed to create auto-renew subscription:', subErr);
      // Payment still succeeded — subscription creation failure is non-fatal
    }
  } else if (product.type === 'subscription') {
    // Non-auto-renew subscription product: create a simple record (no Stripe sub)
    const periodEnd = calculatePeriodEnd(product.interval, product.interval_count);
    await supabaseAdmin.from('mushi_subscriptions').insert({
      customer_id: customerId,
      product_id: productId,
      payment_method_id: paymentMethodId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      granted: product.grants,
    });
  }

  console.log(`Payment ${paymentIntent.id} succeeded and fulfilled for ${customer.email}`);
}

async function handlePaymentIntentFailed(
  supabaseAdmin: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const metadata = paymentIntent.metadata;
  const linkId = metadata?.mushi_payment_link_id;
  const customerId = metadata?.mushi_customer_id;
  const productId = metadata?.mushi_product_id;

  if (!linkId || !customerId) return;

  await supabaseAdmin.from('mushi_payments').insert({
    customer_id: customerId,
    payment_link_id: linkId,
    amount_usd: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    provider: 'stripe',
    provider_payment_id: paymentIntent.id,
    status: 'failed',
    product_id: productId,
    description: 'Payment failed',
    failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error',
  });
}

async function handleInvoicePaid(
  supabaseAdmin: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  // Handle subscription renewal payments
  if (!invoice.subscription) return;

  const { data: sub } = await supabaseAdmin
    .from('mushi_subscriptions')
    .select('*, product:mushi_products(*), customer:mushi_customers(*)')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!sub) return;

  // Calculate amounts
  const amountPaid = (invoice.amount_paid || 0) / 100;
  const discountPercent = sub.discount_percent || 0;
  const originalAmount = sub.product.price_usd;

  // Record the renewal payment
  await supabaseAdmin.from('mushi_payments').insert({
    customer_id: sub.customer.id,
    product_id: sub.product.id,
    amount_usd: amountPaid,
    original_amount_usd: originalAmount,
    discount_percent: discountPercent,
    currency: invoice.currency || 'usd',
    provider: 'stripe',
    provider_payment_id: invoice.payment_intent as string || invoice.id,
    status: 'succeeded',
    description: `${sub.product.public_name || sub.product.name}${discountPercent ? ` (${discountPercent}% off)` : ''}`,
  });

  // Update subscription period
  if (invoice.lines?.data?.[0]) {
    const line = invoice.lines.data[0];
    await supabaseAdmin
      .from('mushi_subscriptions')
      .update({
        current_period_start: new Date((line.period?.start || 0) * 1000).toISOString(),
        current_period_end: new Date((line.period?.end || 0) * 1000).toISOString(),
      })
      .eq('id', sub.id);
  }

  // Re-fulfill on renewal (add credits / activate membership / activate tier)
  const fulfillResult = await fulfillPayment(sub.product, sub.customer, {
    current_period_end: sub.current_period_end,
  });

  console.log(`Subscription renewal fulfilled for ${sub.customer.email} (discount: ${discountPercent}%, paid: $${amountPaid})`);
}

async function handleInvoicePaymentFailed(
  supabaseAdmin: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  if (!invoice.subscription) return;

  await supabaseAdmin
    .from('mushi_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);
}

async function handleSubscriptionUpdated(
  supabaseAdmin: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    paused: 'paused',
  };

  await supabaseAdmin
    .from('mushi_subscriptions')
    .update({
      status: statusMap[subscription.status] || subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(
  supabaseAdmin: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  await supabaseAdmin
    .from('mushi_subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);
}

// ============================================================
// Helpers
// ============================================================

async function savePaymentMethod(
  supabaseAdmin: ReturnType<typeof createClient>,
  customerId: string,
  stripePaymentMethodId: string
): Promise<string | null> {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-12-18.acacia',
    });

    const pm = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    // Check if already saved
    const { data: existing } = await supabaseAdmin
      .from('mushi_payment_methods')
      .select('id')
      .eq('customer_id', customerId)
      .eq('external_id', stripePaymentMethodId)
      .single();

    if (existing) return existing.id;

    const { data: saved } = await supabaseAdmin
      .from('mushi_payment_methods')
      .insert({
        customer_id: customerId,
        provider: 'stripe',
        external_id: stripePaymentMethodId,
        type: pm.type === 'card' ? 'card' : 'paypal',
        card_brand: pm.card?.brand,
        card_last4: pm.card?.last4,
        card_exp_month: pm.card?.exp_month,
        card_exp_year: pm.card?.exp_year,
      })
      .select('id')
      .single();

    return saved?.id || null;
  } catch (err) {
    console.error('Failed to save payment method:', err);
    return null;
  }
}

function calculatePeriodEnd(interval: string | null, intervalCount: number = 1): Date {
  const now = new Date();
  switch (interval) {
    case 'month':
      now.setMonth(now.getMonth() + intervalCount);
      break;
    case '6_months':
      now.setMonth(now.getMonth() + 6);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() + intervalCount);
      break;
    default:
      // One-time: set far future
      now.setFullYear(now.getFullYear() + 100);
  }
  return now;
}

Deno.serve(handler);
