import { Link } from 'react-router-dom'
import PageHero from '@/components/PageHero'

const SITEMAP_SECTIONS = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Testimonials', to: '/testimonials' },
      { label: 'Server Status', to: '/server-status' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Hosting Plans',
    links: [
      { label: 'Shared Hosting', to: '/hosting/shared' },
      { label: 'WordPress Hosting', to: '/hosting/wordpress' },
      { label: 'VPS Hosting', to: '/hosting/vps' },
      { label: 'Dedicated Servers', to: '/hosting/dedicated' },
    ],
  },
  {
    title: 'Help Center',
    links: [
      { label: 'Knowledge Base', to: '/help' },
      { label: 'Getting Started', to: '/help/getting-started' },
      { label: 'Domain Management', to: '/help/domains' },
      { label: 'Email Hosting', to: '/help/email' },
      { label: 'WordPress Hosting', to: '/help/wordpress' },
      { label: 'Security & SSL', to: '/help/security' },
      { label: 'Billing & Account', to: '/help/billing' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Refund Policy', to: '/refund-policy' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
]

export default function Sitemap() {
  return (
    <>
      <PageHero title="Sitemap" subtitle="Find everything on MushiHost" />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {SITEMAP_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
