import { Link } from 'react-router-dom'
import { Server } from 'lucide-react'

export default function BrandHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground no-underline">
          <Server className="h-6 w-6 text-primary" />
          MushiHost
        </Link>
        <span className="text-sm text-muted-foreground">
          Secure Payment
        </span>
      </div>
    </header>
  )
}
