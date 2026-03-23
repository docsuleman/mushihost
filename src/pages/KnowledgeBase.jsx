import { Link } from 'react-router-dom'
import PageHero from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { KB_CATEGORIES } from '@/data/kbArticles'
import { BookOpen, Globe, Mail, Shield, CreditCard, Rocket, ChevronRight } from 'lucide-react'

const CATEGORY_ICONS = {
  'getting-started': Rocket,
  domains: Globe,
  email: Mail,
  wordpress: BookOpen,
  security: Shield,
  billing: CreditCard,
}

export default function KnowledgeBase() {
  return (
    <>
      <PageHero title="Help Center" subtitle="Find guides, tutorials, and answers to your hosting questions" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {KB_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || BookOpen
            return (
              <Link key={cat.slug} to={`/help/${cat.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <CardContent className="p-6">
                    <Icon className="mb-3 h-8 w-8 text-primary" />
                    <h3 className="font-semibold text-lg">{cat.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium">
                      {cat.articles.length} articles
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
