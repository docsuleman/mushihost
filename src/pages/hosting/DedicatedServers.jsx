import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cpu, HardDrive, Shield, Zap, Server, Network, Lock, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: Server, title: 'Bare-Metal Performance', description: 'Full hardware dedicated to your applications — no sharing.' },
  { icon: Cpu, title: 'Latest Intel/AMD CPUs', description: 'Enterprise-grade processors for maximum computing power.' },
  { icon: HardDrive, title: 'NVMe RAID Storage', description: 'Redundant NVMe arrays for speed and data protection.' },
  { icon: Network, title: '10 Gbps Network', description: 'Premium network with 10 Gbps ports and low latency.' },
  { icon: Shield, title: 'DDoS Mitigation', description: 'Always-on enterprise DDoS protection at the network edge.' },
  { icon: Lock, title: 'IPMI Access', description: 'Remote management console for full hardware control.' },
  { icon: Zap, title: '99.99% Uptime SLA', description: 'Enhanced uptime guarantee backed by service credits.' },
  { icon: Headphones, title: 'Managed Services', description: 'Optional fully managed administration and monitoring.' },
]

const PLANS = [
  {
    name: 'DS-1',
    price: '$99.99',
    specs: ['Intel Xeon E-2236', '32 GB DDR4 ECC', '2x 500 GB NVMe (RAID 1)', '30 TB Bandwidth', 'Full Root Access', '5 IPv4 Addresses', 'DDoS Protection'],
  },
  {
    name: 'DS-2',
    price: '$179.99',
    popular: true,
    specs: ['Intel Xeon W-2245', '64 GB DDR4 ECC', '2x 1 TB NVMe (RAID 1)', '50 TB Bandwidth', 'Full Root Access', '10 IPv4 Addresses', 'DDoS Protection', 'Managed Support'],
  },
  {
    name: 'DS-3',
    price: '$299.99',
    specs: ['AMD EPYC 7443P', '128 GB DDR4 ECC', '4x 2 TB NVMe (RAID 10)', 'Unmetered Bandwidth', 'Full Root Access', '16 IPv4 Addresses', 'DDoS Protection', 'Fully Managed', '99.99% SLA'],
  },
]

export default function DedicatedServers() {
  return (
    <>
      <PageHero title="Dedicated Servers" subtitle="Maximum performance with hardware that's exclusively yours" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold mb-10">Dedicated Server Features</h2>
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
          <h2 className="text-center text-2xl font-bold mb-10">Server Configurations</h2>
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
                    Configure Server
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        heading="Need a Custom Configuration?"
        description="Contact our sales team for custom server builds tailored to your requirements."
        buttonText="Contact Sales"
        buttonLink="/contact"
      />
    </>
  )
}
