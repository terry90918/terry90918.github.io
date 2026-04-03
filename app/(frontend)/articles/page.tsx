import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsPaginated, getPostsByTag, getAllTags } from '@/lib/payload'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'

export const metadata: Metadata = {
  title: '法律新知 | 劉尹惠律師事務所',
  description:
    '劉尹惠律師的法律專欄，分享民事訴訟、刑事辯護、婚姻家事、遺產繼承等法律知識與案例分析。',
  openGraph: {
    title: '法律新知 | 劉尹惠律師事務所',
    description: '劉尹惠律師的法律專欄，分享法律知識與案例分析。',
    url: 'https://lawyer.jurislm.com/articles',
    type: 'website',
  },
}

export const revalidate = 60

interface ArticlesPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { tag, page } = await searchParams
  const currentPage = parseInt(page ?? '1', 10)
  const limit = 9

  let posts
  let pagination

  if (tag) {
    const tagPosts = await getPostsByTag(tag)
    posts = tagPosts.slice((currentPage - 1) * limit, currentPage * limit)
    pagination = {
      page: currentPage,
      pages: Math.ceil(tagPosts.length / limit),
      total: tagPosts.length,
    }
  } else {
    const result = await getPostsPaginated({ page: currentPage, limit })
    posts = result.data
    pagination = result.pagination
  }

  const tags = await getAllTags()

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header */}
      <header className="px-6 pt-16 pb-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-primary animate-fade-up mb-4 text-xs tracking-[0.2em] uppercase">
            Legal Articles
          </p>
          <h1 className="font-display text-text-dark dark:text-text-light animate-fade-up mb-6 text-4xl [animation-delay:100ms] md:text-5xl">
            法律新知
          </h1>
          <p className="text-text-dark dark:text-text-light animate-fade-up max-w-2xl text-lg leading-8 tracking-[0.02em] opacity-80 [animation-delay:200ms]">
            分享法律知識、案例分析與實務經驗，幫助您了解法律權益與保護自己的方法。
          </p>
        </div>
      </header>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <section className="px-6 pb-8 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/articles"
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  !tag
                    ? 'bg-primary text-white'
                    : 'bg-text-dark/10 dark:bg-text-light/10 text-text-dark dark:text-text-light hover:bg-text-dark/20 dark:hover:bg-text-light/20'
                }`}
              >
                全部文章
              </Link>
              {tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/articles?tag=${encodeURIComponent(t.slug)}`}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    tag === t.slug
                      ? 'bg-primary text-white'
                      : 'bg-text-dark/10 dark:bg-text-light/10 text-text-dark dark:text-text-light hover:bg-text-dark/20 dark:hover:bg-text-light/20'
                  }`}
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <main className="px-6 pb-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          {posts.length === 0 ? (
            <div className="py-24 text-center">
              <span className="material-symbols-outlined text-text-muted mb-4 text-6xl opacity-50">
                article
              </span>
              <p className="text-text-muted text-lg">
                {tag ? `目前沒有此標籤的文章` : '目前沒有文章'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <ArticleCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <section className="px-6 pb-16 md:px-12">
          <div className="mx-auto max-w-7xl">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              basePath="/articles"
              queryParams={tag ? { tag } : {}}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-text-dark/20 dark:border-text-light/20 border-t px-6 py-8 md:px-12">
        <div className="text-text-muted mx-auto max-w-7xl text-center text-sm">
          <p>&copy; {new Date().getFullYear()} 劉尹惠律師事務所. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
