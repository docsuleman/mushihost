import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { fulfillPayment } from '../_shared/fulfill.ts';
import { generateInvoice } from '../_shared/invoice.ts';

const SUPABASE_URL = resolveSupabaseUrl();
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') ?? '';
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? '';
const PAYPAL_API_URL = Deno.env.get('PAYPAL_API_URL') ?? 'https://api-m.paypal.com';

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
    const eventType = body.event_type;
    const eventId = body.id;

    // Verify webhook with PayPal (Phase 2 — for now, log and process)
    // TODO: Implement PayPal webhook signature verification

    // Idempotency check
    const { data: existing } = await supabaseAdmin
      .from('mushi_webhook_events')
      .select('id')
      .eq('provider', 'paypal')
      .eq('event_id', eventId)
      .single();

    if (existing) {
      return jsonResponse({ received: true, message: 'Already processed' });
    }

    // Log event
    await supabaseAdmin.from('mushi_webhook_events').insert({
      provider: 'paypal',
      event_id: eventId,
      event_type: eventType,
      payload: body,
      processed: false,
    });

    try {
      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED': {
          const capture = body.resource;
          const customId = capture.custom_id; // We'll store mushi_payment_link_id here
          if (customId) {
            // Process similar to Stripe payment_intent.succeeded
            console.log('PayPal capture completed:', capture.id);
          }
          break;
        }

        case 'BILLING.SUBSCRIPTION.CANCELLED': {
          const subscriptionId = body.resource?.id;
          if (subscriptionId) {
            await supabaseAdmin
              .from('mushi_subscriptions')
              .update({ status: 'cancelled' })
              .eq('paypal_subscription_id', subscriptionId);
          }
          break;
        }

        case 'BILLING.SUBSCRIPTION.SUSPENDED': {
          const subscriptionId = body.resource?.id;
          if (subscriptionId) {
            await supabaseAdmin
              .from('mushi_subscriptions')
              .update({ status: 'paused' })
              .eq('paypal_subscription_id', subscriptionId);
          }
          break;
        }

        case 'BILLING.SUBSCRIPTION.ACTIVATED': {
          const subscriptionId = body.resource?.id;
          if (subscriptionId) {
            await supabaseAdmin
              .from('mushi_subscriptions')
              .update({ status: 'active' })
              .eq('paypal_subscription_id', subscriptionId);
          }
          break;
        }

        default:
          console.log(`Unhandled PayPal event: ${eventType}`);
      }

      await supabaseAdmin
        .from('mushi_webhook_events')
        .update({ processed: true })
        .eq('provider', 'paypal')
        .eq('event_id', eventId);
    } catch (processErr) {
      console.error(`Error processing PayPal ${eventType}:`, processErr);
      await supabaseAdmin
        .from('mushi_webhook_events')
        .update({ error: processErr.message })
        .eq('provider', 'paypal')
        .eq('event_id', eventId);
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error('Error in mushi-paypal-webhook:', err);
    return errorResponse(err.message, 500);
  }
};

Deno.serve(handler);
