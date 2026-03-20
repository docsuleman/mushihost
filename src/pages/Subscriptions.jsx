import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/DashboardLayout'
import SubscriptionCard from '@/components/SubscriptionCard'
import { getCustomerByEmail } from '@/helpers/api'

export default function Subscriptions() {
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomerByEmail(null)
        setSubscriptions(data?.subscriptions || [])
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout title="Subscriptions" description="Manage your active subscriptions">
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No subscriptions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
