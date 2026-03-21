import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getStripe } from '../_shared/stripe.ts';
import { fulfillPayment } from '../_shared/fulfill.ts';
import { generateInvoice } from '../_shared/invoice.ts';

const SUPABASE_URL = resolveSupabaseUrl();

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await request.json();
    const { action, token } = body;

    // Load payment link with related data
    const { data: link, error: linkErr } = await supabaseAdmin
      .from('mushi_payment_links')
      .select(`
        *,
        product:mushi_products(*),
        customer:mushi_customers(*)
      `)
      .eq('token', token)
      .single();

    if (linkErr || !link) {
      return errorResponse('Invalid payment link', 404);
    }

    // ============= VALIDATE =============
    if (action === 'validate') {
      if (link.status === 'expired' || new Date(link.expires_at) < new Date()) {
        // Auto-expire if past date
        if (link.status === 'pending') {
          await supabaseAdmin
            .from('mushi_payment_links')
            .update({ status: 'expired' })
            .eq('id', link.id);
        }
        return jsonResponse({ status: 'expired' });
      }

      if (link.status === 'completed') {
        return jsonResponse({ status: 'completed' });
      }

      return jsonResponse({
        status: 'pending',
        product: link.product,
        amount_usd: link.amount_usd,
        source_site: link.source_site,
        auto_renew: !!link.auto_renew,
        customer: {
          email: link.customer?.email,
          first_name: link.customer?.first_name,
        },
      });
    }

    // ============= CREATE PAYMENT INTENT =============
    if (action === 'create_intent') {
      if (link.status !== 'pending') {
        return errorResponse(`Payment link is ${link.status}`, 400);
      }

      if (new Date(link.expires_at) < new Date()) {
        await supabaseAdmin
          .from('mushi_payment_links')
          .update({ status: 'expired' })
          .eq('id', link.id);
        return errorResponse('Payment link has expired', 400);
      }

      const stripe = getStripe();

      // Ensure Stripe customer exists
      let stripeCustomerId = link.customer?.stripe_customer_id;
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: link.customer.email,
          metadata: {
            mushi_customer_id: link.customer.id,
          },
        });
        stripeCustomerId = stripeCustomer.id;

        await supabaseAdmin
          .from('mushi_customers')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', link.customer.id);
      }

      const isSubscription = link.product.type === 'subscription';

      if (isSubscription) {
        // For subscriptions, create a Stripe Subscription with a payment
        // First we need a SetupIntent or use Checkout Session approach
        // For Phase 1 MVP, treat subscriptions as one-time with manual renewal tracking
        // Phase 2 will add proper Stripe Subscription creation

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(link.amount_usd * 100),
          currency: 'usd',
          customer: stripeCustomerId,
          metadata: {
            mushi_payment_link_id: link.id,
            mushi_customer_id: link.customer.id,
            mushi_product_id: link.product.id,
            source_site: link.source_site,
          },
          automatic_payment_methods: { enabled: true },
        });

        return jsonResponse({
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
        });
      } else {
        // One-time payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(link.amount_usd * 100),
          currency: 'usd',
          customer: stripeCustomerId,
          metadata: {
            mushi_payment_link_id: link.id,
            mushi_customer_id: link.customer.id,
            mushi_product_id: link.product.id,
            source_site: link.source_site,
          },
          automatic_payment_methods: { enabled: true },
        });

        return jsonResponse({
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
        });
      }
    }

    // ============= PROCESS (called after frontend confirms) =============
    if (action === 'process') {
      // This action is used for manual confirmation flow
      // Most of the processing happens in the webhook for reliability
      return jsonResponse({ status: 'processing', message: 'Payment is being processed via webhook' });
    }

    return errorResponse('Invalid action', 400);
  } catch (err) {
    console.error('Error in mushi-checkout:', err);
    return errorResponse(err.message, 500);
  }
};

Deno.serve(handler);
