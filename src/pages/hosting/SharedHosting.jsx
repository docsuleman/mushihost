import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Shield, HardDrive, Clock, Headphones, Globe, Mail, Database } from 'lucide-react'

const FEATURES = [
  { icon: HardDrive, title: 'NVMe SSD Storage', description: 'Up to 200 GB of ultra-fast NVMe storage for blazing performance.' },
  { icon: Shield, title: 'Free SSL Certificates', description: 'Auto-provisioned Let\'s Encrypt SSL for every domain.' },
  { icon: Globe, title: 'Global CDN', description: 'Content delivered from edge locations across 6 continents.' },
  { icon: Mail, title: 'Email Hosting', description: 'Professional email accounts with spam filtering included.' },
  { icon: Database, title: 'MySQL Databases', description: 'Unlimited MySQL databases with phpMyAdmin access.' },
  { icon: Clock, title: 'Automated Backups', description: 'Regular backups so your data is always safe.' },
  { icon: Zap, title: 'One-Click Installer', description: '400+ apps including WordPress, Joomla, and Drupal.' },
  { icon: Headphones, title: '24/7 Support', description: 'Expert help available around the clock via chat and email.' },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$4.99',
    specs: ['1 Website', '10 GB NVMe Storage', '100 GB Bandwidth', '1 Email Account', 'Weekly Backups', 'Free SSL'],
  },
  {
    name: 'Business',
    price: '$9.99',
    popular: true,
    specs: ['Unlimited Websites', '50 GB NVMe Storage', 'Unlimited Bandwidth', '50 Email Accounts', 'Daily Backups', 'Free SSL', 'Free Domain'],
  },
  {
    name: 'Enterprise',
    price: '$24.99',
    specs: ['Unlimited Websites', '200 GB NVMe Storage', 'Unlimited Bandwidth', 'Unlimited Email Accounts', 'Real-time Backups', 'Free SSL', 'Free Domain', 'Staging Environment'],
  },
]

export default function SharedHosting() {
  return (
    <>
      <PageHero title="Shared Hosting" subtitle="Affordable, reliable hosting for websites of all sizes" />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold mb-10">What You Get</h2>
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
          <h2 className="text-center text-2xl font-bold mb-10">Choose Your Plan</h2>
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
