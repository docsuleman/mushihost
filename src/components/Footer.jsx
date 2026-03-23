import { Link } from 'react-router-dom'
import { Server } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Hosting',
    links: [
      { label: 'Shared Hosting', to: '/hosting/shared' },
      { label: 'WordPress Hosting', to: '/hosting/wordpress' },
      { label: 'VPS Hosting', to: '/hosting/vps' },
      { label: 'Dedicated Servers', to: '/hosting/dedicated' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Testimonials', to: '/testimonials' },
      { label: 'Server Status', to: '/server-status' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Sitemap', to: '/sitemap' },
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
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground no-underline">
              <Server className="h-5 w-5 text-primary" />
              MushiHost
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Fast, secure, and reliable web hosting trusted by thousands of customers worldwide.
            </p>
          </div>

          {/* Link Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MushiHost. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/refund-policy" className="hover:text-foreground">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
