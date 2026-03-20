import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/DashboardLayout'
import { getCustomerByEmail } from '@/helpers/api'
import { CreditCard } from 'lucide-react'

const CARD_BRAND_COLORS = {
  visa: 'text-blue-600',
  mastercard: 'text-orange-600',
  amex: 'text-blue-800',
}

export default function PaymentMethods() {
  const [loading, setLoading] = useState(true)
  const [methods, setMethods] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomerByEmail(null)
        setMethods(data?.payment_methods || [])
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout title="Payment Methods" description="Manage your saved payment methods">
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : methods.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No saved payment methods.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Payment methods are saved when you make a purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className={`h-6 w-6 ${CARD_BRAND_COLORS[method.card_brand] || 'text-muted-foreground'}`} />
                  <div>
                    {method.type === 'card' ? (
                      <>
                        <p className="font-medium text-sm capitalize">
                          {method.card_brand} &bull;&bull;&bull;&bull; {method.card_last4}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires {String(method.card_exp_month).padStart(2, '0')}/{method.card_exp_year}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-sm">PayPal</p>
                        <p className="text-xs text-muted-foreground">{method.paypal_email}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.is_default && <Badge>Default</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
