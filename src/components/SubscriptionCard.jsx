import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS = {
  active: 'default',
  past_due: 'destructive',
  paused: 'secondary',
  cancelled: 'destructive',
  expired: 'secondary',
}

export default function SubscriptionCard({ subscription, onManage }) {
  const product = subscription.product

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base">{product?.public_name || product?.name}</CardTitle>
        </div>
        <Badge variant={STATUS_COLORS[subscription.status] || 'secondary'}>
          {subscription.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{formatCurrency(product?.price_usd)}/{product?.interval}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current Period</span>
          <span>{formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</span>
        </div>
        {subscription.cancel_at_period_end && (
          <p className="text-sm text-destructive">Cancels at period end</p>
        )}
        {onManage && subscription.status === 'active' && (
          <Button variant="outline" size="sm" className="mt-2" onClick={() => onManage(subscription)}>
            Manage
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
