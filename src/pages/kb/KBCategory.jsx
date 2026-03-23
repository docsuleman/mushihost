import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/PageHero'
import { ChevronDown, ArrowLeft } from 'lucide-react'

function Article({ article }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium cursor-pointer hover:text-primary transition-colors"
      >
        {article.title}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {article.content}
        </div>
      )}
    </div>
  )
}

export default function KBCategory({ category }) {
  if (!category) return null

  return (
    <>
      <PageHero title={category.title} subtitle={category.description} />

      <section className="mx-auto max-w-3xl px-4 py-16">
        <Link to="/help" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <div className="rounded-lg border border-border mt-4">
          <div className="px-4">
            {category.articles.map((article) => (
              <Article key={article.title} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
