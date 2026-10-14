import Link from 'next/link'
import { getPosts } from '@/lib/posts/queries'
import { classifyPost } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'

export const metadata = pageMetadata(
  'AI 日報',
  '依日期探索已發佈的 AI 日報，整理 AI 研究、產品與產業資訊；單篇沿用原始網址。',
  '/posts/ai-daily'
)

export default async function AIDailyPage() {
  const posts = (await getPosts()).filter(
    (post) => post.status === 'published' && classifyPost(post) === 'ai-daily'
  )
  return (
    <div className="pb-10 md:pb-14">
      <header className="py-10 md:pt-16 md:pb-11">
        <Link href="/posts" className="text-accent text-sm underline underline-offset-4">
          回到全部文章
        </Link>
        <h1 className="mt-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
          AI 日報
        </h1>
        <p className="mt-5 max-w-prose leading-[1.85] opacity-80 md:text-lg">
          AI 研究、產品與產業資訊的持續整理。這裡保留每一期，按發佈日期往回讀。
        </p>
        <p className="mt-2 text-sm opacity-65">共 {posts.length} 篇已發佈日報</p>
      </header>
      <div className="bg-card border-border rounded-(--radius) border px-5 md:px-6">
        {posts.length === 0 ? (
          <p>目前沒有已發佈日報。</p>
        ) : (
          posts.map((post) => <WritingPostCard key={post.slug} post={post} />)
        )}
      </div>
    </div>
  )
}
