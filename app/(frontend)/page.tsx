import Image from 'next/image'
import Link from 'next/link'
import { getLatestPosts } from '@/lib/posts/queries'
import type { Post } from '@/lib/posts/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface PostCardProps {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  const year = post.publishedAt ? new Date(post.publishedAt).getFullYear() : ''
  const href = post.publishedAt
    ? `/posts/${year}/${post.slug}`
    : `/posts/${new Date().getFullYear()}/${post.slug}`

  return (
    <article className="py-3">
      <Link
        href={href}
        className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      >
        <h2 className="text-accent text-base leading-6 font-bold transition-opacity group-hover:opacity-70">
          {post.title}
        </h2>
        <p className="text-foreground mt-0.5 text-xs leading-5 opacity-55">
          {post.publishedAt ? `Published: ${formatDate(post.publishedAt)}` : 'Draft'}
          {post.readingTime ? ` • ${post.readingTime} min read` : ''}
        </p>
        {post.excerpt && (
          <p className="text-foreground mt-1 line-clamp-2 text-sm leading-5 opacity-70">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  )
}

export default async function HomePage() {
  const posts = await getLatestPosts(10)

  return (
    <div data-testid="homepage-inner" className="-mt-2 w-full">
      <section
        data-testid="homepage-hero"
        aria-labelledby="homepage-title"
        className="border-border flex flex-col items-start gap-6 border-b pb-4 sm:flex-row sm:items-center sm:gap-4"
      >
        <Link
          href="/about"
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          <Image
            src="https://github.com/terry90918.png"
            alt="Terry Chen avatar"
            width={160}
            height={160}
            className="h-28 w-28 rounded-full sm:h-40 sm:w-40"
            priority
            unoptimized
          />
        </Link>
        <div className="min-w-0">
          <h1
            id="homepage-title"
            className="text-foreground text-[1.625rem] leading-8 font-bold sm:text-[1.875rem] sm:leading-9"
          >
            Hi, I&apos;m Terry.TY Chen.
          </h1>
          <p className="text-foreground mt-2 max-w-lg text-sm leading-5 opacity-70 sm:text-base sm:leading-6">
            AI-powered tools from Swift roots to web frontiers. Every commit lands on GitHub for you
            to fork &amp; remix.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="https://github.com/terry90918"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              GitHub
            </Link>
            <Link
              href="https://x.com/zxtw17985321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              X
            </Link>
            <Link
              href="https://www.linkedin.com/in/tien-yi-chen-98812812a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Latest posts" className="pt-6">
        {posts.length === 0 ? (
          <p className="text-foreground text-sm opacity-50">No posts yet. Stay tuned!</p>
        ) : (
          <div data-testid="homepage-post-list" className="space-y-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link
            href="/posts"
            className="text-accent rounded-sm text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            All Posts →
          </Link>
        </div>
      </section>
    </div>
  )
}
