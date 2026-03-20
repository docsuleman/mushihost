import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/DashboardLayout'
import AutoLoadSettings from '@/components/AutoLoadSettings'
import { getCustomerByEmail } from '@/helpers/api'
import { invokeEdgeFunction } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AutoLoad() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomerByEmail(null)
        setCustomer(data)
        setLogs(data?.auto_load_logs || [])
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (settings) => {
    await invokeEdgeFunction('mushi-manage-subscription', {
      action: 'update_auto_load',
      ...settings,
    })
    setCustomer((prev) => ({ ...prev, ...settings }))
  }

  if (loading) {
    return (
      <DashboardLayout title="Auto-Load Credits">
        <Skeleton className="h-64 w-full" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Auto-Load Credits" description="Automatically top up your MyQBank credits">
      <div className="space-y-6">
        <AutoLoadSettings settings={customer} onSave={handleSave} />

        {/* Auto-Load History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Auto-Load History</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No auto-load events yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">
                        {log.credits_before} &rarr; {log.credits_after} credits
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === 'succeeded' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <span className="font-medium">{formatCurrency(log.amount_charged)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
