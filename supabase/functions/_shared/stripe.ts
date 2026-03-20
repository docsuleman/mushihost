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
