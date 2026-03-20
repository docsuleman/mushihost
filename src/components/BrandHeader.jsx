import { Link } from 'react-router-dom'
import { Server } from 'lucide-react'

const SITE_LABELS = {
  myqbank: 'MyQBank',
  freemedtube: 'FreemedTube',
  mymedbooks: 'MyMedBooks',
}

export default function BrandHeader({ sourceSite }) {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground no-underline">
          <Server className="h-6 w-6 text-primary" />
          MushiHost
        </Link>
        {sourceSite && (
          <span className="text-sm text-muted-foreground">
            Payment for {SITE_LABELS[sourceSite] || sourceSite}
          </span>
        )}
      </div>
    </header>
  )
}
