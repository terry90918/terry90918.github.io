import Link from 'next/link'
import { getPostsByYearMonth } from '@/lib/posts/queries'
import { classifyPost } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'

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
    <div className="pb-10 md:pb-14">
      <header className="py-10 md:pt-16 md:pb-11">
        <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">文章</h1>
        <p className="mt-5 max-w-prose leading-[1.85] opacity-80 md:text-lg">
          持續整理的 AI 資訊與翻譯，按年份放在這裡。日報是資訊整理；翻譯標明原作者與來源。
        </p>
      </header>
      {(hasDaily || softwareEngineeringTranslation) && (
        <nav
          aria-label="文章主題"
          className="border-border flex flex-wrap gap-3 border-y py-6 text-sm"
        >
          {hasDaily && (
            <Link
              href="/posts/ai-daily"
              className="text-accent bg-card border-border hover:bg-accent-surface inline-flex min-h-11 items-center rounded-(--radius) border px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              AI 資訊
            </Link>
          )}
          {softwareEngineeringTranslation && (
            <a
              href={`#writing-${softwareEngineeringTranslation.year}-${softwareEngineeringTranslation.slug}`}
              className="text-accent bg-card border-border hover:bg-accent-surface inline-flex min-h-11 items-center rounded-(--radius) border px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              軟體工程
            </a>
          )}
          <a
            href="#all-posts"
            className="text-accent bg-card border-border hover:bg-accent-surface inline-flex min-h-11 items-center rounded-(--radius) border px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            按年份閱讀
          </a>
        </nav>
      )}
      <div id="all-posts" data-writing-entry className="pb-10 md:pb-14">
        {grouped.length === 0 ? (
          <p>目前沒有已發佈文章。</p>
        ) : (
          grouped.map(({ year, months }) => (
            <section key={year} className="w-full max-w-none px-0">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{year}</h2>
              <div className="mt-6 space-y-8">
                {months.map(({ month, posts }) => (
                  <div
                    key={month}
                    className="bg-card border-border rounded-(--radius) border px-5 md:px-6"
                  >
                    <h3 className="border-border border-b py-5 text-sm font-medium opacity-65">
                      {month} 月 · {posts.length} 篇
                    </h3>
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
