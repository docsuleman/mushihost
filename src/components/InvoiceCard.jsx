import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_VARIANT = {
  finalized: 'default',
  draft: 'secondary',
  void: 'destructive',
}

export default function InvoiceCard({ invoice }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{invoice.invoice_number}</p>
            <p className="text-xs text-muted-foreground">{formatDate(invoice.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[invoice.status] || 'secondary'}>
            {invoice.status}
          </Badge>
          <span className="font-semibold text-sm">{formatCurrency(invoice.total_usd)}</span>
          {invoice.pdf_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={invoice.pdf_url} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
