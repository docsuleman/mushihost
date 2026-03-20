import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from '../_shared/supabase.ts';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts';

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

    // Try to get authenticated user first
    const supabase = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: request.headers.get('Authorization') || '' } },
    });

    const body = await request.json().catch(() => ({}));
    let email: string | null = body.email;
    const token: string | null = body.token;

    // If no email provided, try to get from auth session
    if (!email) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        email = user.email;
      }
    }

    // If token provided, look up from payment link
    if (!email && token) {
      const { data: link } = await supabaseAdmin
        .from('mushi_payment_links')
        .select('customer:mushi_customers(email)')
        .eq('token', token)
        .single();
      if (link?.customer?.email) {
        email = link.customer.email;
      }
    }

    if (!email) {
      return errorResponse('No email or authentication provided', 401);
    }

    // Get customer with all related data
    const { data: customer, error } = await supabaseAdmin
      .from('mushi_customers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !customer) {
      return errorResponse('Customer not found', 404);
    }

    // Fetch related data in parallel
    const [subsResult, paymentsResult, methodsResult, invoicesResult, logsResult] = await Promise.all([
      supabaseAdmin
        .from('mushi_subscriptions')
        .select('*, product:mushi_products(*)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('mushi_payments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('mushi_payment_methods')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('mushi_invoices')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('mushi_auto_load_log')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    return jsonResponse({
      ...customer,
      subscriptions: subsResult.data || [],
      payments: paymentsResult.data || [],
      payment_methods: methodsResult.data || [],
      invoices: invoicesResult.data || [],
      auto_load_logs: logsResult.data || [],
    });
  } catch (err) {
    console.error('Error in mushi-get-customer:', err);
    return errorResponse(err.message, 500);
  }
};

Deno.serve(handler);
