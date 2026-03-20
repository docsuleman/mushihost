import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from './supabase.ts';

interface FulfillmentResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Fulfill a payment by granting credits, activating subscriptions, etc.
 * This function routes based on the site and product grants.
 */
export async function fulfillPayment(
  product: {
    site: string;
    grants: Record<string, unknown>;
    type: string;
    name: string;
  },
  customer: {
    id: string;
    email: string;
    supabase_user_id?: string;
    freemedtube_user_id?: number;
    mymedbooks_user_id?: string;
  },
  subscription?: {
    current_period_end?: string;
  }
): Promise<FulfillmentResult> {
  const SUPABASE_URL = resolveSupabaseUrl();
  const supabaseAdmin = createClient(
    SUPABASE_URL,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const grants = product.grants || {};

  try {
    switch (product.site) {
      case 'myqbank':
        return await fulfillMyQBank(supabaseAdmin, customer, grants);

      case 'freemedtube':
        return await fulfillFreemedTube(customer, grants, subscription);

      case 'mymedbooks':
        return await fulfillMyMedBooks(customer, grants, subscription);

      default:
        return { success: false, error: `Unknown site: ${product.site}` };
    }
  } catch (err) {
    console.error(`Fulfillment error for ${product.site}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * MyQBank fulfillment: Add credits to the Credits table.
 * Also handles AI credits via the ai_credits grant key.
 */
async function fulfillMyQBank(
  supabaseAdmin: ReturnType<typeof createClient>,
  customer: { supabase_user_id?: string; email: string },
  grants: Record<string, unknown>
): Promise<FulfillmentResult> {
  const userId = customer.supabase_user_id;
  if (!userId) {
    return { success: false, error: 'No supabase_user_id linked for MyQBank fulfillment' };
  }

  const results: Record<string, unknown> = {};

  // Add regular credits
  if (grants.credits) {
    const creditsToAdd = Number(grants.credits);
    const { error } = await supabaseAdmin.rpc('add_credits', {
      p_user_id: userId,
      p_amount: creditsToAdd,
    });

    if (error) {
      // Fallback: direct update
      const { data: current } = await supabaseAdmin
        .from('Credits')
        .select('Credit')
        .eq('id_Users', userId)
        .single();

      if (current) {
        const { error: updateErr } = await supabaseAdmin
          .from('Credits')
          .update({ Credit: (current.Credit || 0) + creditsToAdd })
          .eq('id_Users', userId);
        if (updateErr) return { success: false, error: updateErr.message };
      } else {
        const { error: insertErr } = await supabaseAdmin
          .from('Credits')
          .insert({ id_Users: userId, Credit: creditsToAdd });
        if (insertErr) return { success: false, error: insertErr.message };
      }
    }
    results.credits_added = creditsToAdd;
  }

  // Add AI credits
  if (grants.ai_credits) {
    const aiCreditsToAdd = Number(grants.ai_credits);
    const { error } = await supabaseAdmin.rpc('add_ai_credits', {
      p_user_id: userId,
      p_amount: aiCreditsToAdd,
    });
    if (error) {
      console.error('Failed to add AI credits via RPC, trying direct update:', error);
      // Fallback: direct update on Credits table ai_credits column
      const { data: current } = await supabaseAdmin
        .from('Credits')
        .select('ai_credits')
        .eq('id_Users', userId)
        .single();

      if (current) {
        await supabaseAdmin
          .from('Credits')
          .update({ ai_credits: (current.ai_credits || 0) + aiCreditsToAdd })
          .eq('id_Users', userId);
      }
    }
    results.ai_credits_added = aiCreditsToAdd;
  }

  return { success: true, data: results };
}

/**
 * FreemedTube fulfillment: Activate membership via internal API.
 * Also cross-grants MyQBank credits if specified.
 */
async function fulfillFreemedTube(
  customer: { email: string; freemedtube_user_id?: number; supabase_user_id?: string },
  grants: Record<string, unknown>,
  subscription?: { current_period_end?: string }
): Promise<FulfillmentResult> {
  const results: Record<string, unknown> = {};

  // Activate FreemedTube membership
  if (grants.tier) {
    const freemedtubeApiUrl = Deno.env.get('FREEMEDTUBE_API_URL') || 'https://api.freemedtube.net';
    const freemedtubeSecret = Deno.env.get('FREEMEDTUBE_MUSHI_SECRET') || '';

    const response = await fetch(`${freemedtubeApiUrl}/api/v1/internal/activate-membership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mushi-Secret': freemedtubeSecret,
      },
      body: JSON.stringify({
        email: customer.email,
        user_id: customer.freemedtube_user_id,
        tier: grants.tier,
        period_end: subscription?.current_period_end,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('FreemedTube activation failed:', errText);
      results.freemedtube_error = errText;
    } else {
      results.freemedtube_activated = true;
    }
  }

  // Cross-grant MyQBank credits
  if (grants.mqb_credits && customer.supabase_user_id) {
    const SUPABASE_URL = resolveSupabaseUrl();
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const mqbCredits = Number(grants.mqb_credits);
    const { data: current } = await supabaseAdmin
      .from('Credits')
      .select('Credit')
      .eq('id_Users', customer.supabase_user_id)
      .single();

    if (current) {
      await supabaseAdmin
        .from('Credits')
        .update({ Credit: (current.Credit || 0) + mqbCredits })
        .eq('id_Users', customer.supabase_user_id);
    }
    results.mqb_credits_added = mqbCredits;
  }

  return { success: true, data: results };
}

/**
 * MyMedBooks fulfillment: Activate subscription tier via internal API.
 */
async function fulfillMyMedBooks(
  customer: { email: string; mymedbooks_user_id?: string },
  grants: Record<string, unknown>,
  subscription?: { current_period_end?: string }
): Promise<FulfillmentResult> {
  if (!grants.tier) {
    return { success: false, error: 'No tier specified for MyMedBooks' };
  }

  const mymedbooksApiUrl = Deno.env.get('MYMEDBOOKS_API_URL') || 'https://api.mymedbooks.com';
  const mymedbooksSecret = Deno.env.get('MYMEDBOOKS_MUSHI_SECRET') || '';

  const response = await fetch(`${mymedbooksApiUrl}/api/internal/activate-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Mushi-Secret': mymedbooksSecret,
    },
    body: JSON.stringify({
      email: customer.email,
      user_id: customer.mymedbooks_user_id,
      tier_name: grants.tier,
      level: grants.level,
      period_end: subscription?.current_period_end,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return { success: false, error: `MyMedBooks activation failed: ${errText}` };
  }

  return { success: true, data: { mymedbooks_activated: true, tier: grants.tier } };
}
