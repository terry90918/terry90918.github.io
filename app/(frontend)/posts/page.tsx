import Link from 'next/link'
import type { Metadata } from 'next'
import { getPostsByYearMonth } from '@/lib/payload/queries'
import type { Post } from '@/payload-types'

export const metadata: Metadata = {
  title: 'All Posts',
  description: 'Browse all blog posts by Terry Chen.',
}

export const revalidate = 3600

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function PostCard({ post }: { post: Post }) {
  const year = post.publishedAt
    ? new Date(post.publishedAt).getFullYear()
    : new Date().getFullYear()
  const href = `/posts/${year}/${post.slug}`

  return (
    <article className="border-border border-b py-3 last:border-0">
      <Link href={href} className="group block">
        <h3 className="text-foreground group-hover:text-accent text-sm font-bold transition-colors">
          {post.title}
        </h3>
        <p className="text-foreground mt-0.5 text-xs opacity-50">
          {post.publishedAt ? formatDate(post.publishedAt) : 'Unpublished'}
          {post.readingTime ? ` • ${post.readingTime} min read` : ''}
        </p>
        {post.excerpt && (
          <p className="text-foreground mt-1 line-clamp-2 text-xs opacity-60">{post.excerpt}</p>
        )}
      </Link>
    </article>
  )
}

export default async function PostsPage() {
  const grouped = await getPostsByYearMonth()

  const totalPosts = grouped.reduce(
    (acc, y) => acc + y.months.reduce((a, m) => a + m.posts.length, 0),
    0
  )

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">All Posts</h1>
        <p className="text-foreground mt-1 text-sm opacity-50">
          Browse all blog posts by year and month
        </p>
      </div>

      {grouped.length === 0 ? (
        <p className="text-foreground text-sm opacity-50">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ year, months }) => {
            const yearTotal = months.reduce((a, m) => a + m.posts.length, 0)
            return (
              <div key={year}>
                <div className="mb-4 flex items-baseline gap-2">
                  <h2 className="text-foreground text-lg font-bold">{year}</h2>
                  <span className="text-foreground text-sm opacity-40">{yearTotal}</span>
                </div>
                <div className="border-border space-y-6 border-l pl-4">
                  {months.map(({ month, monthName, posts }) => (
                    <div key={month}>
                      <h3 className="text-foreground mb-2 text-sm font-bold opacity-60">
                        {monthName} <span className="font-normal opacity-60">({posts.length})</span>
                      </h3>
                      <div>
                        {posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="text-foreground mt-8 text-xs opacity-30">
        {totalPosts} post{totalPosts !== 1 ? 's' : ''} total
      </div>
    </section>
  )
}
