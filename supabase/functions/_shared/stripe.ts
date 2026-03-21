import Stripe from 'https://esm.sh/stripe@17?target=deno&no-check';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

const AUTO_RENEW_COUPON_ID = 'mushi_auto_renew_15';

/**
 * Ensure the 15% auto-renewal coupon exists in Stripe.
 * Creates it if not found, returns the coupon ID.
 */
export async function ensureAutoRenewCoupon(): Promise<string> {
  const stripe = getStripe();
  try {
    await stripe.coupons.retrieve(AUTO_RENEW_COUPON_ID);
  } catch {
    await stripe.coupons.create({
      id: AUTO_RENEW_COUPON_ID,
      percent_off: 15,
      duration: 'forever',
      name: 'Auto-Renewal 15% Discount',
    });
    console.log('Created auto-renew coupon:', AUTO_RENEW_COUPON_ID);
  }
  return AUTO_RENEW_COUPON_ID;
}

/**
 * Get or create a recurring Stripe Price for the given product.
 * Used to set up subscriptions after the first one-time payment.
 */
export async function getOrCreateRecurringPrice(
  product: {
    id: string;
    name: string;
    price_usd: number;
    interval?: string;
    interval_count?: number;
    stripe_price_id?: string;
  },
  supabaseAdmin: ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2?target=deno&no-check').createClient>
): Promise<string> {
  // Return existing if already set
  if (product.stripe_price_id) {
    return product.stripe_price_id;
  }

  const stripe = getStripe();

  // Map our interval to Stripe's interval
  let stripeInterval: 'month' | 'year' = 'month';
  let intervalCount = 1;

  if (product.interval === 'year') {
    stripeInterval = 'year';
    intervalCount = product.interval_count || 1;
  } else if (product.interval === '6_months') {
    stripeInterval = 'month';
    intervalCount = 6;
  } else {
    // Default to monthly for credit packs and monthly products
    stripeInterval = 'month';
    intervalCount = product.interval_count || 1;
  }

  // Create a Stripe Product + Price
  const stripeProduct = await stripe.products.create({
    name: `${product.name} (Auto-Renewal)`,
    metadata: { mushi_product_id: product.id },
  });

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: Math.round(product.price_usd * 100),
    currency: 'usd',
    recurring: {
      interval: stripeInterval,
      interval_count: intervalCount,
    },
  });

  // Save the price ID back to the product
  await supabaseAdmin
    .from('mushi_products')
    .update({ stripe_price_id: stripePrice.id })
    .eq('id', product.id);

  console.log(`Created recurring Stripe Price ${stripePrice.id} for product ${product.id}`);
  return stripePrice.id;
}
