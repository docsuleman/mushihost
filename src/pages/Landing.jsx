import { Link } from 'react-router-dom'
import { Server, Shield, CreditCard, Zap, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'PCI-compliant processing via Stripe and PayPal with end-to-end encryption.',
  },
  {
    icon: CreditCard,
    title: 'Multiple Methods',
    description: 'Accept credit cards, debit cards, and PayPal with saved payment methods.',
  },
  {
    icon: Zap,
    title: 'Auto-Load Credits',
    description: 'Never run out — automatically top up your credits when they run low.',
  },
  {
    icon: Globe,
    title: 'Unified Platform',
    description: 'One payment portal for MyQBank, FreemedTube, and MyMedBooks.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Server className="h-6 w-6 text-primary" />
            MushiHost
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="cursor-pointer">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Centralized Payment Gateway
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Secure, unified payment processing for medical education platforms.
          Purchase credits, subscribe to plans, and manage billing — all in one place.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium">Powering</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-medium">MyQBank</span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 font-medium">FreemedTube</span>
          <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 font-medium">MyMedBooks</span>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex gap-4 p-6">
                <feature.icon className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} MushiHost. Secure payment processing.
      </footer>
    </div>
  )
}
