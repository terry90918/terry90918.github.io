import Image from 'next/image'
import Link from 'next/link'
import type { Article, Tag, Media as MediaType } from '@/payload-types'

interface ArticleCardProps {
  post: Article
}

export function ArticleCard({ post }: ArticleCardProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const excerpt = post.excerpt
    ? post.excerpt.slice(0, 100) + (post.excerpt.length > 100 ? '...' : '')
    : ''

  const featureImage =
    post.featureImage && typeof post.featureImage === 'object'
      ? (post.featureImage as MediaType)
      : null

  const tags = (post.tags ?? []).filter((t): t is Tag => typeof t === 'object')

  return (
    <Link href={`/articles/${post.slug}`} className="group block">
      <article className="bg-background-light dark:bg-background-dark/50 h-full overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg">
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {featureImage?.url ? (
            <Image
              src={featureImage.url}
              alt={featureImage.alt ?? post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-primary/10 flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-primary/30 text-6xl">article</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-text-dark dark:text-text-light group-hover:text-primary mb-3 line-clamp-2 text-xl font-medium transition-colors duration-300">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-text-dark dark:text-text-light mb-4 line-clamp-3 text-sm opacity-80">
            {excerpt}
          </p>

          {/* Date */}
          <time className="text-text-muted text-xs">{publishedDate}</time>
        </div>
      </article>
    </Link>
  )
}
