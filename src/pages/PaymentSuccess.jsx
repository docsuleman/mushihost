import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BrandHeader from '@/components/BrandHeader'
import { CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const SITE_URLS = {
  myqbank: 'https://myqbanks.com',
  freemedtube: 'https://app.freemedtube.net',
  mymedbooks: 'https://mymedbooks.com',
}

export default function PaymentSuccess() {
  const { state } = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader sourceSite={state?.site} />
      <div className="mx-auto max-w-lg px-4 py-20">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            {state?.already ? (
              <p className="mt-2 text-muted-foreground">
                This payment has already been processed.
              </p>
            ) : (
              <>
                <p className="mt-2 text-muted-foreground">
                  Your payment of {state?.amount ? formatCurrency(state.amount) : 'your purchase'} for{' '}
                  <strong>{state?.product || 'your order'}</strong> has been processed successfully.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A confirmation email will be sent to your registered email address.
                </p>
              </>
            )}
            <div className="mt-6 flex gap-3">
              {state?.site && SITE_URLS[state.site] && (
                <Button asChild className="cursor-pointer">
                  <a href={SITE_URLS[state.site]}>
                    Return to {state.site === 'myqbank' ? 'MyQBank' : state.site === 'freemedtube' ? 'FreemedTube' : 'MyMedBooks'}
                  </a>
                </Button>
              )}
              <Button variant="outline" asChild className="cursor-pointer">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
