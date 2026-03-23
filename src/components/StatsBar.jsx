import { Globe, Clock, Headphones, Users } from 'lucide-react'

const STATS = [
  { icon: Users, value: '10,000+', label: 'Websites Hosted' },
  { icon: Clock, value: '99.9%', label: 'Uptime Guarantee' },
  { icon: Headphones, value: '24/7', label: 'Expert Support' },
  { icon: Globe, value: '150+', label: 'Countries Served' },
]

export default function StatsBar() {
  return (
    <section className="border-y border-border bg-muted/40 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <stat.icon className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
