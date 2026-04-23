import Image from 'next/image'
import Link from 'next/link'
import { getLatestPosts } from '@/lib/posts/queries'
import type { Post } from '@/lib/posts/types'

export const revalidate = 3600

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
    <article className="border-border border-b py-4 last:border-0">
      <Link href={href} className="group block">
        <h2 className="text-foreground group-hover:text-accent text-base font-bold transition-colors">
          {post.title}
        </h2>
        <p className="text-foreground mt-1 text-xs opacity-50">
          {post.publishedAt ? `Published: ${formatDate(post.publishedAt)}` : 'Draft'}
          {post.readingTime ? ` • ${post.readingTime} min read` : ''}
        </p>
        {post.excerpt && (
          <p className="text-foreground mt-2 line-clamp-2 text-sm opacity-70">{post.excerpt}</p>
        )}
      </Link>
    </article>
  )
}

export default async function HomePage() {
  const posts = await getLatestPosts(10)

  return (
    <>
      {/* Hero */}
      <section className="py-12">
        <div className="flex flex-col gap-6">
          <Link href="/about" className="w-fit">
            <Image
              src="https://github.com/terry90918.png"
              alt="Terry Chen avatar"
              width={48}
              height={48}
              className="rounded-full"
              unoptimized
            />
          </Link>
          <div>
            <h1 className="text-foreground text-2xl font-bold">Hi, I&apos;m @terry90918.</h1>
            <p className="text-foreground mt-2 max-w-lg text-sm opacity-70">
              Building AI agent systems and MCP tooling in Taiwan. Every commit lands on GitHub.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="https://github.com/terry90918"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub
            </Link>
            <Link
              href="https://x.com/zxtw17985321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              X
            </Link>
            <Link
              href="https://www.linkedin.com/in/tien-yi-chen-98812812a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-4">
        <h2 className="text-foreground mb-4 text-sm font-bold tracking-widest uppercase opacity-40">
          Latest Posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-foreground text-sm opacity-50">No posts yet. Stay tuned!</p>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/posts" className="text-accent text-sm hover:underline">
            All Posts →
          </Link>
        </div>
      </section>
    </>
  )
}
