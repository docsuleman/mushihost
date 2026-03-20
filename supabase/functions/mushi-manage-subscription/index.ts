import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getStripe } from '../_shared/stripe.ts';

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
    const { action, subscription_id, ...params } = body;

    if (!action) {
      return errorResponse('Missing action');
    }

    // ============= UPDATE AUTO-LOAD SETTINGS =============
    if (action === 'update_auto_load') {
      // Authenticate via session
      const supabase = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: request.headers.get('Authorization') || '' } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return errorResponse('Unauthorized', 401);

      const { data: customer } = await supabaseAdmin
        .from('mushi_customers')
        .select('id')
        .eq('supabase_user_id', user.id)
        .single();

      if (!customer) return errorResponse('Customer not found', 404);

      const { error } = await supabaseAdmin
        .from('mushi_customers')
        .update({
          auto_load_enabled: params.auto_load_enabled,
          auto_load_mode: params.auto_load_mode,
          auto_load_threshold: params.auto_load_threshold,
          auto_load_max_monthly: params.auto_load_max_monthly,
          auto_load_pack: params.auto_load_pack,
        })
        .eq('id', customer.id);

      if (error) return errorResponse(error.message, 500);

      return jsonResponse({ success: true });
    }

    // ============= SUBSCRIPTION MANAGEMENT =============
    if (!subscription_id) {
      return errorResponse('Missing subscription_id');
    }

    const { data: sub, error: subErr } = await supabaseAdmin
      .from('mushi_subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .single();

    if (subErr || !sub) {
      return errorResponse('Subscription not found', 404);
    }

    const stripe = getStripe();

    switch (action) {
      case 'cancel': {
        if (sub.stripe_subscription_id) {
          await stripe.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: true,
          });
        }
        await supabaseAdmin
          .from('mushi_subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('id', subscription_id);
        return jsonResponse({ success: true, message: 'Subscription will cancel at period end' });
      }

      case 'cancel_immediately': {
        if (sub.stripe_subscription_id) {
          await stripe.subscriptions.cancel(sub.stripe_subscription_id);
        }
        await supabaseAdmin
          .from('mushi_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscription_id);
        return jsonResponse({ success: true, message: 'Subscription cancelled immediately' });
      }

      case 'resume': {
        if (sub.stripe_subscription_id) {
          await stripe.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: false,
          });
        }
        await supabaseAdmin
          .from('mushi_subscriptions')
          .update({ cancel_at_period_end: false, status: 'active' })
          .eq('id', subscription_id);
        return jsonResponse({ success: true, message: 'Subscription resumed' });
      }

      case 'change_payment_method': {
        const { payment_method_id } = params;
        if (!payment_method_id) return errorResponse('Missing payment_method_id');

        if (sub.stripe_subscription_id) {
          const { data: method } = await supabaseAdmin
            .from('mushi_payment_methods')
            .select('external_id')
            .eq('id', payment_method_id)
            .single();

          if (method?.external_id) {
            await stripe.subscriptions.update(sub.stripe_subscription_id, {
              default_payment_method: method.external_id,
            });
          }
        }

        await supabaseAdmin
          .from('mushi_subscriptions')
          .update({ payment_method_id })
          .eq('id', subscription_id);

        return jsonResponse({ success: true });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (err) {
    console.error('Error in mushi-manage-subscription:', err);
    return errorResponse(err.message, 500);
  }
};

Deno.serve(handler);
