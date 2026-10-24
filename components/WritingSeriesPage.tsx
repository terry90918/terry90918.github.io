import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { SiteEyebrow } from '@/components/SitePrimitives'
import { WritingPostCard } from '@/components/WritingPostCard'
import { getPosts } from '@/lib/posts/queries'
import { getSeriesPosts, WRITING_SERIES, type WritingSeries } from '@/lib/site/writing-series'

export default async function WritingSeriesPage({ series }: { series: WritingSeries }) {
  const topic = WRITING_SERIES[series]
  const posts = getSeriesPosts(await getPosts(), series)
  return (
    <div className="site-page">
      <header className="site-page-intro">
        <Link href="/posts" className="site-text-link mb-5">
          ← 回到全部文章
        </Link>
        <SiteEyebrow>
          <span className="site-dot" />
          {topic.title}
        </SiteEyebrow>
        <h1>{topic.title}</h1>
        <p className="site-lead">{topic.description}</p>
        <p className="mt-2 text-sm opacity-65">
          共 {posts.length} 篇已發佈文章，依發布時間由新到舊排列。
        </p>
      </header>
      <section aria-label={`${topic.title} 系列文章`}>
        <Card asChild className="gap-0 px-6">
          <div className="site-card site-writing">
            {posts.length === 0 ? (
              <p>目前沒有已發佈文章。</p>
            ) : (
              posts.map((post) => <WritingPostCard key={post.slug} post={post} />)
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
