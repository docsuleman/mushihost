import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/DashboardLayout'
import { getCustomerByEmail } from '@/helpers/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomerByEmail(null)
        setPayments(data?.payments || [])
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout title="Payment History" description="View all your past transactions">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No payment history yet.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.created_at)} &middot; {payment.provider}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={payment.status === 'succeeded' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    <span className="font-semibold text-sm">{formatCurrency(payment.amount_usd)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
