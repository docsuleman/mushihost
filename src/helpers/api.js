import { invokeEdgeFunction } from '@/lib/supabase'

export async function validatePaymentLink(token) {
  return invokeEdgeFunction('mushi-checkout', {
    action: 'validate',
    token,
  })
}

export async function processCheckout({ token, provider, paymentMethodId, savePaymentMethod }) {
  return invokeEdgeFunction('mushi-checkout', {
    action: 'process',
    token,
    provider,
    payment_method_id: paymentMethodId,
    save_payment_method: savePaymentMethod,
  })
}

export async function createPaymentIntent({ token, provider }) {
  return invokeEdgeFunction('mushi-checkout', {
    action: 'create_intent',
    token,
    provider,
  })
}

export async function getCustomer(token) {
  return invokeEdgeFunction('mushi-get-customer', { token })
}

export async function getCustomerByEmail(email) {
  return invokeEdgeFunction('mushi-get-customer', { email })
}
