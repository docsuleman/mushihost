import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/DashboardLayout'
import { getCustomerByEmail } from '@/helpers/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Receipt, History, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        // In production, this would use the authenticated user's session
        const data = await getCustomerByEmail(null) // Will use session
        setCustomer(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Unable to load dashboard. Please try again later.</p>
            <p className="text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const activeSubscriptions = customer?.subscriptions?.filter((s) => s.status === 'active') || []
  const recentPayments = customer?.payments?.slice(0, 5) || []
  const savedMethods = customer?.payment_methods || []

  return (
    <DashboardLayout title="Dashboard" description={`Welcome back, ${customer?.first_name || customer?.email || 'User'}`}>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              Active Subscriptions
            </div>
            <p className="mt-1 text-2xl font-bold">{activeSubscriptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              Total Payments
            </div>
            <p className="mt-1 text-2xl font-bold">{customer?.payments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Saved Methods
            </div>
            <p className="mt-1 text-2xl font-bold">{savedMethods.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Payments</CardTitle>
          <Link to="/dashboard/history" className="flex items-center gap-1 text-sm text-primary no-underline hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                      {payment.status}
                    </Badge>
                    <span className="font-medium">{formatCurrency(payment.amount_usd)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
