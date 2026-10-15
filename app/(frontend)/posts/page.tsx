import Link from 'next/link'
import { getPostsByYearMonth } from '@/lib/posts/queries'
import { classifyPost } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'
import { SitePageIntro } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '文章',
  '按年份閱讀 Terry 的文章，探索 AI 日報系列與翻譯文章；內容標明類型與原文來源。',
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
  const softwareEngineeringTranslation = posts.find(
    (post) =>
      classifyPost(post) === 'translation' && post.tags.some((tag) => tag.name === '軟體工程')
  )
  const hasDaily = posts.some((post) => classifyPost(post) === 'ai-daily')

  return (
    <div className="site-page">
      <SitePageIntro label="文章" title="文章">
        <p className="site-lead">
          持續整理的 AI 資訊與翻譯，按年份放在這裡。日報是資訊整理；翻譯標明原作者與來源。
        </p>
      </SitePageIntro>
      {(hasDaily || softwareEngineeringTranslation) && (
        <nav aria-label="文章主題" className="site-topic-nav">
          {hasDaily && (
            <Link href="/posts/ai-daily" className="site-button">
              AI 資訊
            </Link>
          )}
          {softwareEngineeringTranslation && (
            <a
              href={`#writing-${softwareEngineeringTranslation.year}-${softwareEngineeringTranslation.slug}`}
              className="site-button"
            >
              軟體工程
            </a>
          )}
          <a href="#all-posts" className="site-button">
            按年份閱讀
          </a>
        </nav>
      )}
      <div id="all-posts" data-writing-entry className="pb-10 md:pb-14">
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
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <p className="mt-6 text-sm opacity-65">
        共 {publishedCount} 篇已發佈文章{draftCount > 0 && ` · ${draftCount} 篇草稿（開發預覽）`}
      </p>
    </div>
  )
}
