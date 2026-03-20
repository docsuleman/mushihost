import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/DashboardLayout'
import InvoiceCard from '@/components/InvoiceCard'
import { getCustomerByEmail } from '@/helpers/api'

export default function Invoices() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomerByEmail(null)
        setInvoices(data?.invoices || [])
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout title="Invoices" description="Download your payment invoices">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No invoices yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
