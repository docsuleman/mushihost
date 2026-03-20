import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

let stripePromise = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey)
  }
  return stripePromise
}
