import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import BrandHeader from '@/components/BrandHeader'
import PaymentForm from '@/components/PaymentForm'
import { validatePaymentLink, createPaymentIntent } from '@/helpers/api'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react'

export default function PaymentPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [linkData, setLinkData] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        // Validate payment link
        const data = await validatePaymentLink(token)
        if (data.status === 'expired') {
          setError('This payment link has expired. Please request a new one.')
          setLoading(false)
          return
        }
        if (data.status === 'completed') {
          navigate('/pay/success', { state: { already: true } })
          return
        }
        setLinkData(data)

        // Create payment intent
        const intent = await createPaymentIntent({ token, provider: 'stripe' })
        setClientSecret(intent.client_secret)
      } catch (err) {
        setError(err.message || 'Failed to load payment details.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [token, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BrandHeader />
        <div className="mx-auto max-w-lg px-4 py-12">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BrandHeader />
        <div className="mx-auto max-w-lg px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const { product, amount_usd, source_site, customer, auto_renew } = linkData

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle>Order Summary</CardTitle>
            </div>
            <CardDescription>Review your purchase details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{product.public_name || product.name}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                {product.type === 'subscription' && (
                  <Badge variant="secondary" className="mt-1">
                    {product.interval === 'month' ? 'Monthly' :
                     product.interval === '6_months' ? 'Every 6 months' : 'Yearly'} subscription
                  </Badge>
                )}
              </div>
              <span className="text-2xl font-bold">{formatCurrency(amount_usd)}</span>
            </div>
            {auto_renew && (
              <>
                <Separator className="my-4" />
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                  <RefreshCw className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Auto-renewal enabled</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Future renewals will be automatically charged at 15% off ({formatCurrency(amount_usd * 0.85)}/renewal)
                    </p>
                  </div>
                </div>
              </>
            )}
            {customer?.email && (
              <>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Paying as <span className="font-medium text-foreground">{customer.email}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stripe Payment Form */}
        {clientSecret && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#6d28d9',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={amount_usd}
                  productName={product.public_name || product.name}
                  onSuccess={(paymentIntent) => {
                    navigate('/pay/success', {
                      state: {
                        paymentId: paymentIntent.id,
                        product: product.public_name || product.name,
                        amount: amount_usd,
                        site: source_site,
                        autoRenew: auto_renew,
                      },
                    })
                  }}
                  onError={() => {}}
                />
              </Elements>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
