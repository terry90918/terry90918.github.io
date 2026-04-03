import Link from 'next/link'
import Image from 'next/image'
import { getLatestPosts } from '@/lib/payload'
import type { Tag, Media as MediaType } from '@/payload-types'

export async function ArticlesSection() {
  const posts = await getLatestPosts(3)

  if (posts.length === 0) {
    return null
  }

  return (
    <section id="articles" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-16 flex items-end justify-between">
          <div>
            <p className="text-accent mb-4 text-xs tracking-[0.2em] uppercase">Legal Knowledge</p>
            <h2 className="font-display text-text-dark dark:text-text-light text-4xl md:text-5xl">
              法律新知
            </h2>
          </div>
          <Link
            href="/articles"
            className="text-accent hover:text-primary group hidden items-center gap-2 text-sm transition-colors md:flex"
          >
            <span>查看全部文章</span>
            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
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
              <Link key={post.id} href={`/articles/${post.slug}`} className="group block">
                <article className="h-full overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:shadow-lg dark:bg-white/5">
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
                        <span className="material-symbols-outlined text-primary/30 text-6xl">
                          article
                        </span>
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
          })}
        </div>

        {/* Mobile Link */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/articles"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-2 rounded-full px-6 py-3 transition-colors"
          >
            <span>查看全部文章</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
