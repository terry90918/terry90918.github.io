import Link from 'next/link'
import { getPostsByYearMonth } from '@/lib/posts/queries'
import { classifyPost } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'

export const metadata = pageMetadata(
  '文章',
  '按年份閱讀 Terry 的文章，探索 AI 日報系列與軟體工程翻譯；內容標明類型與原作者。',
  '/posts'
)

export default async function PostsPage() {
  const grouped = (await getPostsByYearMonth())
    .map((year) => ({
      ...year,
      months: year.months
        .map((month) => ({
          ...month,
          posts: month.posts.filter((post) => post.status === 'published'),
        }))
        .filter((month) => month.posts.length > 0),
    }))
    .filter((year) => year.months.length > 0)
  const posts = grouped.flatMap((year) => year.months.flatMap((month) => month.posts))
  const translation = posts.find((post) => classifyPost(post) === 'translation')
  const hasDaily = posts.some((post) => classifyPost(post) === 'ai-daily')

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">文章</h1>
        <p className="mt-4 leading-7 opacity-80">
          持續整理的 AI 資訊與翻譯，按年份放在這裡。日報是資訊整理；翻譯標明原作者與來源。
        </p>
      </header>
      {(hasDaily || translation) && (
        <nav
          aria-label="文章主題"
          className="border-border flex flex-wrap gap-5 border-y py-4 text-sm"
        >
          {hasDaily && (
            <Link
              href="/posts/ai-daily"
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              AI 資訊
            </Link>
          )}
          {translation && (
            <a
              href={`#writing-${translation.year}-${translation.slug}`}
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              軟體工程
            </a>
          )}
          <a
            href="#all-posts"
            className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            按年份閱讀
          </a>
        </nav>
      )}
      <div id="all-posts" data-writing-entry className="space-y-8">
        {grouped.length === 0 ? (
          <p>目前沒有已發佈文章。</p>
        ) : (
          grouped.map(({ year, months }) => (
            <section key={year} className="px-0">
              <h2 className="text-xl font-bold">{year}</h2>
              <div className="border-border mt-4 space-y-6 border-l pl-4">
                {months.map(({ month, posts }) => (
                  <div key={month}>
                    <h3 className="text-sm font-bold opacity-65">
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
      <p className="text-sm opacity-65">共 {posts.length} 篇已發佈文章</p>
    </div>
  )
}
