import Link from 'next/link'
import { getPosts } from '@/lib/posts/queries'
import { classifyPost } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'
import { SiteEyebrow } from '@/components/SitePrimitives'

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
    <div className="site-page">
      <header className="site-page-intro">
        <Link href="/posts" className="site-text-link mb-5">
          回到全部文章
        </Link>
        <SiteEyebrow>
          <span className="site-dot" />
          文章系列
        </SiteEyebrow>
        <h1>AI 日報</h1>
        <p className="site-lead">
          AI 研究、產品與產業資訊的持續整理。這裡保留每一期，按發佈日期往回讀。
        </p>
        <p className="mt-2 text-sm opacity-65">共 {posts.length} 篇已發佈日報</p>
      </header>
      <div className="site-card site-writing mt-14 max-[700px]:mt-9.5">
        {posts.length === 0 ? (
          <p>目前沒有已發佈日報。</p>
        ) : (
          posts.map((post) => <WritingPostCard key={post.slug} post={post} />)
        )}
      </div>
    </div>
  )
}
