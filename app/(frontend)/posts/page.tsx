import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { getPostsByYearMonth } from '@/lib/posts/queries'
import { classifyPost } from '@/lib/site/writing'
import { getSeriesPosts, WRITING_SERIES, type WritingSeries } from '@/lib/site/writing-series'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'
import { SitePageIntro } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '文章',
  '按年份閱讀 Terry 的文章，探索 pstack、Harness²、AI 日報與翻譯文章；內容標明類型與原文來源。',
  '/posts'
)

export default async function PostsPage() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const grouped = (await getPostsByYearMonth())
    .map((year) => ({
      ...year,
      months: year.months
        .map((month) => ({
          ...month,
          posts: month.posts.filter((post) => isDevelopment || post.status === 'published'),
        }))
        .filter((month) => month.posts.length > 0),
    }))
    .filter((year) => year.months.length > 0)
  const posts = grouped.flatMap((year) => year.months.flatMap((month) => month.posts))
  const publishedCount = posts.filter((post) => post.status === 'published').length
  const draftCount = posts.length - publishedCount
  const hasDaily = posts.some((post) => classifyPost(post) === 'ai-daily')
  const seriesIds: WritingSeries[] = ['pstack', 'harness2']
  const series = seriesIds.filter((id) => getSeriesPosts(posts, id).length > 0)

  return (
    <div className="site-page">
      <SitePageIntro label="文章" title="文章">
        <p className="site-lead">
          AI 開發工具、技術解讀、AI 日報與翻譯，按年份整理。翻譯標明原作者與來源。
        </p>
        {(hasDaily || series.length > 0) && (
          <nav aria-label="文章主題" className="site-topic-nav">
            {hasDaily && (
              <Button asChild variant="outline">
                <Link href="/posts/ai-daily">AI 日報</Link>
              </Button>
            )}
            {series.map((id) => (
              <Button asChild variant="outline" key={id}>
                <Link href={`/posts/${id}`}>{WRITING_SERIES[id].title}</Link>
              </Button>
            ))}
          </nav>
        )}
      </SitePageIntro>
      <div id="all-posts" data-writing-entry>
        {grouped.length === 0 ? (
          <p>目前沒有已發佈文章。</p>
        ) : (
          grouped.map(({ year, months }) => (
            <section key={year} className="site-post-year w-full">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{year}</h2>
              <div className="mt-6 space-y-8">
                {months.map(({ month, posts }) => (
                  <div key={month}>
                    <h3 className="site-month-head">
                      {month} 月 <span>{posts.length} 篇</span>
                    </h3>
                    <Card asChild className="gap-0 px-6">
                      <div className="site-card site-writing">
                        {posts.map((post) => (
                          <div
                            key={post.slug}
                            id={`writing-${post.year}-${post.slug}`}
                            data-writing-entry
                          >
                            <WritingPostCard post={post} />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <p className="site-archive-count text-muted-foreground text-sm">
        共 {publishedCount} 篇已發佈文章{draftCount > 0 && ` · ${draftCount} 篇草稿（開發預覽）`}
      </p>
    </div>
  )
}
