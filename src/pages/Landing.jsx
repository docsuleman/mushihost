import { Link } from 'react-router-dom'
import { Server, Shield, Zap, Globe, Clock, Headphones, HardDrive, Cpu, Cloud, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import StatsBar from '@/components/StatsBar'

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

const HOSTING_TYPES = [
  { name: 'Shared Hosting', desc: 'From $4.99/mo', to: '/hosting/shared' },
  { name: 'WordPress Hosting', desc: 'From $5.99/mo', to: '/hosting/wordpress' },
  { name: 'VPS Hosting', desc: 'From $19.99/mo', to: '/hosting/vps' },
  { name: 'Dedicated Servers', desc: 'From $99.99/mo', to: '/hosting/dedicated' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Freelance Designer', text: 'Switched hosts and immediately noticed the speed difference. My portfolio loads in under a second now.' },
  { name: 'James R.', role: 'E-commerce Owner', text: 'Zero downtime during Black Friday. Exactly what my store needed.' },
  { name: 'Emily C.', role: 'Content Creator', text: 'WordPress hosting is perfect for my blog. Support responded in under 10 minutes.' },
]

export default function Landing() {
  return (
    <>
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

      {/* Hosting Types Strip */}
      <section className="border-y border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOSTING_TYPES.map((type) => (
              <Link
                key={type.name}
                to={type.to}
                className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-sm">{type.name}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

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

      {/* Testimonials Preview */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Loved by Thousands</h2>
            <p className="mt-3 text-muted-foreground">Don't just take our word for it — here's what our customers say.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" className="cursor-pointer" asChild>
              <Link to="/testimonials">View All Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-gradient-to-r from-primary to-purple-700 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Need Help?</h2>
          <p className="mt-3 text-white/80">
            Our support team is available 24/7 to help you with any questions.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" className="cursor-pointer px-8" asChild>
              <a href="mailto:support@mushihost.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
