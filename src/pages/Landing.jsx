import { Server, Shield, Zap, Globe, Clock, Headphones, HardDrive, Cpu, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'NVMe SSD storage and optimized servers for lightning-fast load times.',
  },
  {
    icon: Shield,
    title: '99.9% Uptime',
    description: 'Enterprise-grade infrastructure with redundant systems and DDoS protection.',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Content delivered from edge locations worldwide for the best user experience.',
  },
  {
    icon: Clock,
    title: 'Instant Setup',
    description: 'Get your website online in minutes with one-click installs and auto-configuration.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Expert support team available around the clock via live chat and email.',
  },
  {
    icon: Shield,
    title: 'Free SSL',
    description: 'Every plan includes free SSL certificates for secure HTTPS connections.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$4.99',
    period: '/mo',
    description: 'Perfect for personal websites and blogs',
    features: ['1 Website', '10 GB NVMe Storage', 'Free SSL Certificate', '100 GB Bandwidth', 'Weekly Backups', 'Email Support'],
  },
  {
    name: 'Business',
    price: '$9.99',
    period: '/mo',
    description: 'Ideal for growing businesses and online stores',
    popular: true,
    features: ['Unlimited Websites', '50 GB NVMe Storage', 'Free SSL Certificate', 'Unlimited Bandwidth', 'Daily Backups', 'Priority Support', 'Free Domain'],
  },
  {
    name: 'Enterprise',
    price: '$24.99',
    period: '/mo',
    description: 'Maximum power for high-traffic applications',
    features: ['Unlimited Websites', '200 GB NVMe Storage', 'Free SSL Certificate', 'Unlimited Bandwidth', 'Real-time Backups', 'Dedicated Support', 'Free Domain', 'Staging Environment'],
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Server className="h-6 w-6 text-primary" />
            MushiHost
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          <Cloud className="h-4 w-4" />
          Reliable Cloud Hosting
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
          Fast, Secure Web Hosting <br className="hidden sm:block" />
          You Can Count On
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Deploy your websites and applications on our high-performance cloud infrastructure.
          NVMe storage, global CDN, and expert support — starting at just $4.99/mo.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="cursor-pointer text-base px-8" asChild>
            <a href="#pricing">View Plans</a>
          </Button>
          <Button variant="outline" size="lg" className="cursor-pointer text-base px-8" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            NVMe SSD
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Latest Gen CPUs
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            DDoS Protection
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need</h2>
            <p className="mt-3 text-muted-foreground">Powerful features to keep your sites fast, secure, and always online.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
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
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="mt-3 text-muted-foreground">No hidden fees. Cancel anytime. All plans include free SSL and 24/7 support.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg scale-[1.02]' : 'shadow-sm'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    MOST POPULAR
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-6 cursor-pointer ${plan.popular ? '' : 'variant-outline'}`} variant={plan.popular ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Need Help?</h2>
          <p className="mt-3 text-muted-foreground">
            Our support team is available 24/7 to help you with any questions.
          </p>
          <div className="mt-8">
            <Button size="lg" className="cursor-pointer px-8" asChild>
              <a href="mailto:support@mushihost.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Server className="h-4 w-4 text-primary" />
            MushiHost
          </div>
          <p>&copy; {new Date().getFullYear()} MushiHost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
