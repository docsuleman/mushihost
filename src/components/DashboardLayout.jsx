import { Link, useLocation } from 'react-router-dom'
import { Server, LayoutDashboard, CreditCard, History, FileText, Zap, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: Receipt },
  { path: '/dashboard/history', label: 'Payment History', icon: History },
  { path: '/dashboard/methods', label: 'Payment Methods', icon: CreditCard },
  { path: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { path: '/dashboard/auto-load', label: 'Auto-Load', icon: Zap },
]

export default function DashboardLayout({ children, title, description }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground no-underline">
            <Server className="h-6 w-6 text-primary" />
            MushiHost
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <nav className="hidden w-56 shrink-0 md:block">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
                  pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="mb-4 flex gap-1 overflow-x-auto md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium no-underline transition-colors',
                pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="mt-1 text-muted-foreground">{description}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
