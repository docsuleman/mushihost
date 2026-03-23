import { Link } from 'react-router-dom'
import PageHero from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BLOG_POSTS } from '@/data/blogPosts'
import { formatDate } from '@/lib/utils'
import { Clock, ArrowRight } from 'lucide-react'

export default function Blog() {
  return (
    <>
      <PageHero title="Blog" subtitle="Hosting tips, guides, and industry insights from the MushiHost team" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold leading-snug">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(post.date)}</span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      Read more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
