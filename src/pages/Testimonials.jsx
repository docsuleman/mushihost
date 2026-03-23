import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Freelance Designer',
    rating: 5,
    text: 'Switched from a major host and immediately noticed the difference. My portfolio site loads in under a second now. The migration was completely painless — their team handled everything.',
  },
  {
    name: 'James Rodriguez',
    role: 'E-commerce Owner',
    rating: 5,
    text: 'Been with MushiHost for over a year. Zero downtime during Black Friday, which is exactly what my online store needed. The VPS plan gives me all the control I want without the complexity.',
  },
  {
    name: 'Emily Chen',
    role: 'Blogger & Content Creator',
    rating: 5,
    text: 'The WordPress hosting plan is perfect for my blog. Automatic updates, daily backups, and speeds my readers love. Support responded in under 10 minutes when I needed help with DNS.',
  },
  {
    name: 'David Okafor',
    role: 'Startup CTO',
    rating: 5,
    text: 'We run three production apps on MushiHost dedicated servers. The performance is rock-solid and their uptime SLA gives our investors confidence. Highly recommended for serious projects.',
  },
  {
    name: 'Maria Gonzalez',
    role: 'Marketing Agency',
    rating: 4,
    text: 'We manage 20+ client websites on MushiHost. The shared hosting plans are incredibly affordable for smaller sites, and upgrading to VPS for our bigger clients is seamless.',
  },
  {
    name: 'Alex Thompson',
    role: 'Small Business Owner',
    rating: 5,
    text: 'I\'m not technical at all, but MushiHost made setting up my business website incredibly easy. The one-click WordPress install had me online in minutes. Support has been amazing every time I\'ve asked for help.',
  },
  {
    name: 'Priya Sharma',
    role: 'Full-Stack Developer',
    rating: 5,
    text: 'The developer tools and SSH access on even the basic plans is a nice touch. cPanel is clean, SSL provisioning is automatic, and the NVMe storage is noticeably faster than my previous host.',
  },
  {
    name: 'Tom Anderson',
    role: 'Non-Profit Director',
    rating: 5,
    text: 'Affordable pricing without cutting corners on quality. Our non-profit website has been running flawlessly for months. The 30-day money-back guarantee gave us the confidence to switch.',
  },
]

function TestimonialCard({ testimonial }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{testimonial.text}"</p>
        <div>
          <p className="font-semibold text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Testimonials() {
  return (
    <>
      <PageHero title="What Our Customers Say" subtitle="Trusted by thousands of website owners worldwide" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <CTASection
        heading="Join Thousands of Happy Customers"
        description="Start your hosting journey with MushiHost today."
      />
    </>
  )
}
