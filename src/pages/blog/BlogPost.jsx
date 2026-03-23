import { useParams, Link } from 'react-router-dom'
import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { Badge } from '@/components/ui/badge'
import { BLOG_POSTS } from '@/data/blogPosts'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Clock, User } from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams()
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return (
      <>
        <PageHero title="Post Not Found" subtitle="The article you're looking for doesn't exist." />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Link to="/blog" className="text-primary hover:underline">
            &larr; Back to Blog
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHero title={post.title} subtitle={post.excerpt} />

      <article className="mx-auto max-w-3xl px-4 py-16">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          <span>{formatDate(post.date)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        <div className="prose-sm">
          {post.content.map((block, i) => {
            if (block.type === 'heading') {
              return <h2 key={i} className="mt-8 mb-3 text-xl font-semibold">{block.text}</h2>
            }
            return <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{block.text}</p>
          })}
        </div>
      </article>

      <CTASection
        heading="Ready to Experience Better Hosting?"
        description="Join thousands of happy customers on MushiHost."
      />
    </>
  )
}
