import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PaymentForm({ amount, productName, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message)
        setProcessing(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pay/success`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message)
        onError?.(confirmError)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent)
      }
    } catch (err) {
      setError(err.message)
      onError?.(err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full text-base py-6 cursor-pointer"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount)} for {productName}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Payments processed securely by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  )
}
