import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Server, Menu, X, ChevronDown } from 'lucide-react'

const NAV_ITEMS = [
  {
    label: 'Hosting',
    children: [
      { label: 'Shared Hosting', to: '/hosting/shared' },
      { label: 'WordPress Hosting', to: '/hosting/wordpress' },
      { label: 'VPS Hosting', to: '/hosting/vps' },
      { label: 'Dedicated Servers', to: '/hosting/dedicated' },
    ],
  },
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/#pricing' },
  {
    label: 'Company',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Server Status', to: '/server-status' },
    ],
  },
  {
    label: 'Support',
    children: [
      { label: 'Help Center', to: '/help' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
]

function DesktopDropdown({ item }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
        {item.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-[180px] pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="rounded-lg border border-border bg-white p-1.5 shadow-lg">
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileDropdown({ item, open, toggle }) {
  if (!item.children) {
    return (
      <Link to={item.to} className="block px-4 py-2 text-sm font-medium text-foreground">
        {item.label}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-foreground cursor-pointer"
      >
        {item.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-1 pl-4">
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className="block px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground no-underline">
          <Server className="h-6 w-6 text-primary" />
          MushiHost
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <DesktopDropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <Button size="sm" className="cursor-pointer" asChild>
            <Link to="/#pricing">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden cursor-pointer text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="py-2">
            {NAV_ITEMS.map((item) => (
              <MobileDropdown
                key={item.label}
                item={item}
                open={openDropdown === item.label}
                toggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
              />
            ))}
            <div className="px-4 py-3">
              <Button size="sm" className="w-full cursor-pointer" asChild>
                <Link to="/#pricing">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
