import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno&no-check';
import { resolveSupabaseUrl } from './supabase.ts';

/**
 * Generate an invoice record for a payment.
 */
export async function generateInvoice(
  paymentId: string,
  customerId: string,
  amount: number,
  product: { name: string; price_usd: number; site: string }
): Promise<{ invoice_number: string } | null> {
  const SUPABASE_URL = resolveSupabaseUrl();
  const supabaseAdmin = createClient(
    SUPABASE_URL,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get next invoice number
    const { data: invoiceNum } = await supabaseAdmin.rpc('mushi_next_invoice_number');
    const invoiceNumber = invoiceNum || `MH-${new Date().getFullYear()}-0000`;

    const lineItems = [
      {
        description: `${product.name} (${product.site})`,
        amount: product.price_usd,
        quantity: 1,
      },
    ];

    const { data, error } = await supabaseAdmin
      .from('mushi_invoices')
      .insert({
        payment_id: paymentId,
        customer_id: customerId,
        invoice_number: invoiceNumber,
        amount_usd: amount,
        tax_usd: 0,
        total_usd: amount,
        line_items: lineItems,
        status: 'finalized',
      })
      .select('invoice_number')
      .single();

    if (error) {
      console.error('Failed to generate invoice:', error);
      return null;
    }

    return { invoice_number: data.invoice_number };
  } catch (err) {
    console.error('Invoice generation error:', err);
    return null;
  }
}
