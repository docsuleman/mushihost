import PageHero from '@/components/PageHero'
import StatsBar from '@/components/StatsBar'
import CTASection from '@/components/CTASection'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Heart, Users, Globe, Shield, Zap } from 'lucide-react'

const VALUES = [
  { icon: Zap, title: 'Performance First', description: 'We obsess over speed. Every millisecond matters when it comes to your website\'s success.' },
  { icon: Shield, title: 'Security Always', description: 'Your data\'s safety is non-negotiable. We implement enterprise-grade security at every level.' },
  { icon: Heart, title: 'Customer Focused', description: 'Every decision we make starts with the question: how does this benefit our customers?' },
  { icon: Users, title: 'Transparency', description: 'No hidden fees, no surprise charges. What you see is what you get, always.' },
]

const DATA_CENTERS = [
  { location: 'North America', cities: 'New York, Dallas, San Francisco' },
  { location: 'Europe', cities: 'London, Frankfurt, Amsterdam' },
  { location: 'Asia-Pacific', cities: 'Singapore, Tokyo, Sydney' },
]

export default function About() {
  return (
    <>
      <PageHero title="About MushiHost" subtitle="Our mission is to make web hosting fast, reliable, and accessible to everyone" />

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex items-start gap-4 mb-8">
          <Target className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MushiHost was founded with a simple belief: everyone deserves access to fast, secure, and reliable
              web hosting without breaking the bank. What started as a small team of hosting enthusiasts has
              grown into a trusted platform serving thousands of websites across more than 150 countries.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We built MushiHost because we were frustrated with hosting providers that promised the world but
              delivered poor performance, hidden fees, and lackluster support. We set out to do things differently
              — transparent pricing, genuinely fast infrastructure, and a support team that actually cares.
            </p>
          </div>
        </div>
      </section>

      <StatsBar />

      {/* Values */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold mb-10">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <Card key={value.title} className="border-0 shadow-sm">
                <CardContent className="flex gap-4 p-6">
                  <value.icon className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Centers */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10">
            <Globe className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Global Data Centers</h2>
            <p className="mt-2 text-muted-foreground">Strategically located for low-latency performance worldwide</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {DATA_CENTERS.map((dc) => (
              <Card key={dc.location} className="text-center">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">{dc.location}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{dc.cities}</p>
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
