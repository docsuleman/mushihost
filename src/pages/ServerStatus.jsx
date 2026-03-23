import PageHero from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const SERVICES = [
  { name: 'Shared Hosting Servers', region: 'All Regions', uptime: '99.99' },
  { name: 'WordPress Hosting', region: 'All Regions', uptime: '99.99' },
  { name: 'VPS Infrastructure', region: 'All Regions', uptime: '99.98' },
  { name: 'Dedicated Servers', region: 'All Regions', uptime: '100.00' },
  { name: 'DNS Services', region: 'Global', uptime: '100.00' },
  { name: 'Email Servers', region: 'All Regions', uptime: '99.99' },
  { name: 'CDN Network', region: 'Global', uptime: '100.00' },
  { name: 'Control Panel (cPanel)', region: 'All Regions', uptime: '99.99' },
  { name: 'Billing & API', region: 'Global', uptime: '100.00' },
  { name: 'Support Systems', region: 'Global', uptime: '100.00' },
]

export default function ServerStatus() {
  return (
    <>
      <PageHero title="Server Status" subtitle="Real-time status of all MushiHost services" />

      <section className="mx-auto max-w-4xl px-4 py-16">
        {/* Overall Status */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-5">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">All Systems Operational</p>
              <p className="text-sm text-green-700">All services are running smoothly. No incidents reported.</p>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div className="space-y-3">
          {SERVICES.map((service) => (
            <Card key={service.name}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.region}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Uptime bar */}
                  <div className="hidden sm:flex items-center gap-0.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className="h-6 w-1 rounded-full bg-green-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground w-14 text-right">{service.uptime}%</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                    Operational
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Uptime shown for the last 30 days. For historical data or incident reports, contact{' '}
          <a href="mailto:status@mushihost.com" className="text-primary underline">status@mushihost.com</a>.
        </p>
      </section>
    </>
  )
}
