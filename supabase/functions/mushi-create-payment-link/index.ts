import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';

// API keys for each site (set in Supabase Edge Function secrets)
const SITE_API_KEYS: Record<string, string> = {
  myqbank: Deno.env.get('MUSHI_API_KEY_MYQBANK') ?? '',
  freemedtube: Deno.env.get('MUSHI_API_KEY_FREEMEDTUBE') ?? '',
  mymedbooks: Deno.env.get('MUSHI_API_KEY_MYMEDBOOKS') ?? '',
};

const MUSHIHOST_URL = Deno.env.get('MUSHIHOST_URL') ?? 'https://mushihost.com';
const LINK_EXPIRY_HOURS = 24;

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = resolveSupabaseUrl();
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await request.json();
    const { product_id, source_site, source_user_id, source_user_email, context } = body;

    // Validate required fields
    if (!product_id || !source_site || !source_user_email) {
      return errorResponse('Missing required fields: product_id, source_site, source_user_email');
    }

    // Verify API key
    const apiKey = request.headers.get('X-Mushi-Api-Key') || '';
    const expectedKey = SITE_API_KEYS[source_site];
    if (!expectedKey || apiKey !== expectedKey) {
      return errorResponse('Invalid API key', 403);
    }

    // Validate product exists and belongs to the source site
    const { data: product, error: productErr } = await supabaseAdmin
      .from('mushi_products')
      .select('*')
      .eq('id', product_id)
      .eq('site', source_site)
      .eq('is_active', true)
      .single();

    if (productErr || !product) {
      return errorResponse('Product not found or inactive', 404);
    }

    // Find or create customer
    let { data: customer } = await supabaseAdmin
      .from('mushi_customers')
      .select('*')
      .eq('email', source_user_email.toLowerCase())
      .single();

    if (!customer) {
      const insertData: Record<string, unknown> = {
        email: source_user_email.toLowerCase(),
      };

      // Link site-specific user ID
      if (source_site === 'myqbank' && source_user_id) {
        insertData.supabase_user_id = source_user_id;
      } else if (source_site === 'freemedtube' && source_user_id) {
        insertData.freemedtube_user_id = Number(source_user_id);
      } else if (source_site === 'mymedbooks' && source_user_id) {
        insertData.mymedbooks_user_id = source_user_id;
      }

      const { data: newCustomer, error: insertErr } = await supabaseAdmin
        .from('mushi_customers')
        .insert(insertData)
        .select('*')
        .single();

      if (insertErr) {
        console.error('Failed to create customer:', insertErr);
        return errorResponse('Failed to create customer record', 500);
      }
      customer = newCustomer;
    } else {
      // Update site-specific user ID if not yet linked
      const updates: Record<string, unknown> = {};
      if (source_site === 'myqbank' && source_user_id && !customer.supabase_user_id) {
        updates.supabase_user_id = source_user_id;
      } else if (source_site === 'freemedtube' && source_user_id && !customer.freemedtube_user_id) {
        updates.freemedtube_user_id = Number(source_user_id);
      } else if (source_site === 'mymedbooks' && source_user_id && !customer.mymedbooks_user_id) {
        updates.mymedbooks_user_id = source_user_id;
      }

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('mushi_customers')
          .update(updates)
          .eq('id', customer.id);
      }
    }

    // Generate a secure token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date(Date.now() + LINK_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    // Create payment link
    const { data: link, error: linkErr } = await supabaseAdmin
      .from('mushi_payment_links')
      .insert({
        token,
        customer_id: customer.id,
        product_id: product.id,
        source_site,
        source_user_id: source_user_id?.toString(),
        amount_usd: product.price_usd,
        context: context || {},
        expires_at: expiresAt,
      })
      .select('id, token, expires_at')
      .single();

    if (linkErr) {
      console.error('Failed to create payment link:', linkErr);
      return errorResponse('Failed to create payment link', 500);
    }

    return jsonResponse({
      url: `${MUSHIHOST_URL}/pay/${link.token}`,
      token: link.token,
      expires_at: link.expires_at,
      amount_usd: product.price_usd,
      product_name: product.name,
    });
  } catch (err) {
    console.error('Error in mushi-create-payment-link:', err);
    return errorResponse(err.message, 500);
  }
};

Deno.serve(handler);
