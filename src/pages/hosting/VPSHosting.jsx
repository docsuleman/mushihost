import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cpu, HardDrive, Shield, Zap, Terminal, RefreshCw, Globe, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: Cpu, title: 'Dedicated Resources', description: 'Guaranteed CPU, RAM, and storage that\'s yours alone.' },
  { icon: Terminal, title: 'Full Root Access', description: 'Complete control over your server environment.' },
  { icon: Zap, title: 'SSD Performance', description: 'NVMe SSDs for maximum I/O and application speed.' },
  { icon: Shield, title: 'DDoS Protection', description: 'Enterprise-grade DDoS mitigation included free.' },
  { icon: RefreshCw, title: 'Instant Scaling', description: 'Upgrade CPU, RAM, or storage in seconds with no downtime.' },
  { icon: Globe, title: 'Choice of Location', description: 'Deploy in North America, Europe, or Asia-Pacific.' },
  { icon: HardDrive, title: 'Weekly Snapshots', description: 'Automated snapshots for quick disaster recovery.' },
  { icon: Headphones, title: 'Managed Support', description: 'Optional managed support for server administration.' },
]

const PLANS = [
  {
    name: 'VPS 1',
    price: '$19.99',
    specs: ['2 vCPU Cores', '4 GB RAM', '80 GB NVMe SSD', '4 TB Bandwidth', 'Full Root Access', 'Free SSL'],
  },
  {
    name: 'VPS 2',
    price: '$39.99',
    popular: true,
    specs: ['4 vCPU Cores', '8 GB RAM', '160 GB NVMe SSD', '8 TB Bandwidth', 'Full Root Access', 'Free SSL', 'Weekly Snapshots'],
  },
  {
    name: 'VPS 3',
    price: '$79.99',
    specs: ['8 vCPU Cores', '16 GB RAM', '320 GB NVMe SSD', '16 TB Bandwidth', 'Full Root Access', 'Free SSL', 'Daily Snapshots', 'Managed Support'],
  },
]

export default function VPSHosting() {
  return (
    <>
      <PageHero title="VPS Hosting" subtitle="Powerful virtual private servers with dedicated resources" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold mb-10">VPS Features</h2>
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

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold mb-10">VPS Plans</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-primary border-2' : ''}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-1.5">
                    BEST VALUE
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
