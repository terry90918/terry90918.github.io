import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPostBySlug, getAdjacentPosts, getAllPostSlugs } from '@/lib/payload/queries'
import type { Post, Tag } from '@/payload-types'

export const revalidate = 3600

interface PageParams {
  params: Promise<{ year: string; slug: string }>
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
  }
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  // We don't have year info here, so generate for current year as fallback
  // This will still work because getPostBySlug uses the slug only
  return slugs.map((slug) => ({
    year: String(new Date().getFullYear()),
    slug,
  }))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function TagBadge({ tag }: { tag: Tag | number }) {
  if (typeof tag === 'number') return null
  return (
    <span className="bg-muted text-foreground inline-block rounded px-2 py-0.5 text-xs opacity-70">
      {tag.name}
    </span>
  )
}

function ShareLinks({ post, siteUrl }: { post: Post; siteUrl: string }) {
  const url = encodeURIComponent(`${siteUrl}/posts/${post.slug}`)
  const title = encodeURIComponent(post.title)

  return (
    <div className="text-foreground flex items-center gap-3 text-xs opacity-60">
      <span>Share:</span>
      <Link
        href={`https://x.com/intent/tweet?url=${url}&text=${title}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        X
      </Link>
      <Link
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        LinkedIn
      </Link>
      <Link
        href={`https://t.me/share/url?url=${url}&text=${title}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        Telegram
      </Link>
      <Link
        href={`mailto:?subject=${title}&body=${url}`}
        className="hover:text-accent transition-colors"
      >
        Email
      </Link>
    </div>
  )
}

export default async function PostPage({ params }: PageParams) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { prev, next } = await getAdjacentPosts(slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terry90918.dev'
  const githubEditUrl = `https://github.com/terry90918/blog/edit/develop/content/${post.slug}.md`

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-foreground text-2xl leading-tight font-bold">{post.title}</h1>
        <div className="text-foreground mt-2 flex flex-wrap items-center gap-3 text-xs opacity-50">
          {post.publishedAt && <span>Published: {formatDate(post.publishedAt)}</span>}
          {post.readingTime && <span>• {post.readingTime} min read</span>}
          <Link
            href={githubEditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            Edit on GitHub
          </Link>
        </div>
      </header>

      {/* Content - Lexical renders as serialized JSON, display as-is for now */}
      <div className="prose prose-sm text-foreground max-w-none">
        {post.excerpt && (
          <p className="text-foreground border-accent mb-6 border-l-2 pl-4 text-base opacity-70">
            {post.excerpt}
          </p>
        )}
        {/* Rich text content would need a Lexical renderer here */}
        <div className="text-foreground text-sm italic opacity-50">
          [Post content rendered here]
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag, i) => (
            <TagBadge key={i} tag={tag} />
          ))}
        </div>
      )}

      {/* Share */}
      <div className="border-border mt-8 border-t pt-4">
        <ShareLinks post={post} siteUrl={siteUrl} />
      </div>

      {/* Prev / Next */}
      <nav className="border-border mt-8 flex justify-between gap-4 border-t pt-4">
        {prev ? (
          <Link
            href={`/posts/${new Date(prev.publishedAt!).getFullYear()}/${prev.slug}`}
            className="text-accent text-sm hover:underline"
          >
            ← {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/posts/${new Date(next.publishedAt!).getFullYear()}/${next.slug}`}
            className="text-accent text-right text-sm hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  )
}
