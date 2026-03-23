import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Shield, RefreshCw, Gauge, Globe, Lock, Layers, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'Optimized for WordPress', description: 'Servers fine-tuned for WordPress performance with LiteSpeed caching.' },
  { icon: RefreshCw, title: 'Auto Updates', description: 'WordPress core, themes, and plugins updated automatically.' },
  { icon: Shield, title: 'WordPress Security', description: 'WAF, malware scanning, and brute-force protection built-in.' },
  { icon: Gauge, title: 'Staging Environment', description: 'Test changes safely before pushing to your live site.' },
  { icon: Globe, title: 'Free CDN', description: 'Global CDN included for faster load times worldwide.' },
  { icon: Lock, title: 'Free SSL', description: 'Automatic SSL certificates for all your WordPress sites.' },
  { icon: Layers, title: 'Pre-installed WordPress', description: 'WordPress is ready to use the moment your account is activated.' },
  { icon: Headphones, title: 'WordPress Experts', description: 'Support team specialized in WordPress troubleshooting.' },
]

const PLANS = [
  {
    name: 'WP Starter',
    price: '$5.99',
    specs: ['1 WordPress Site', '15 GB NVMe Storage', '100 GB Bandwidth', 'Free SSL', 'Weekly Backups', 'Auto Updates'],
  },
  {
    name: 'WP Business',
    price: '$11.99',
    popular: true,
    specs: ['3 WordPress Sites', '50 GB NVMe Storage', 'Unlimited Bandwidth', 'Free SSL', 'Daily Backups', 'Auto Updates', 'Staging Environment', 'Free Domain'],
  },
  {
    name: 'WP Pro',
    price: '$29.99',
    specs: ['Unlimited Sites', '200 GB NVMe Storage', 'Unlimited Bandwidth', 'Free SSL', 'Real-time Backups', 'Auto Updates', 'Staging Environment', 'Free Domain', 'Priority Support'],
  },
]

export default function WordPressHosting() {
  return (
    <>
      <PageHero title="WordPress Hosting" subtitle="Hosting built and optimized specifically for WordPress" />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold mb-10">Built for WordPress</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <f.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold mb-10">WordPress Hosting Plans</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-primary border-2' : ''}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-1.5">
                    MOST POPULAR
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-5 space-y-2">
                    {plan.specs.map((spec) => (
                      <li key={spec} className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {spec}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 cursor-pointer" variant={plan.popular ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
