import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BrandHeader from '@/components/BrandHeader'
import { XCircle } from 'lucide-react'

export default function PaymentFailed() {
  const { state } = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="mx-auto max-w-lg px-4 py-20">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="mt-2 text-muted-foreground">
              {state?.reason || 'Your payment could not be processed. Please try again or use a different payment method.'}
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => window.history.back()} className="cursor-pointer">
                Try Again
              </Button>
              <Button variant="outline" asChild className="cursor-pointer">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
