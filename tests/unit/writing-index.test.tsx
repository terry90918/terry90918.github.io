import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Post } from '../../lib/posts/types'
import PostsPage from '../../app/(frontend)/posts/page'

vi.mock('@/lib/posts/queries', () => ({ getPostsByYearMonth: vi.fn() }))
import { getPostsByYearMonth } from '../../lib/posts/queries'

function post(slug: string, status: Post['status']): Post {
  return {
    title: slug,
    slug,
    status,
    publishedAt: '2026-10-06T00:00:00Z',
    year: '2026',
    tags: [],
    excerpt: '',
    readingTime: 1,
    html: '',
    rawContent: '',
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetAllMocks()
})

describe('Writing index authoring visibility', () => {
  it('keeps a draft returned by the development loader discoverable', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.mocked(getPostsByYearMonth).mockResolvedValue([
      {
        year: 2026,
        months: [
          {
            month: 10,
            monthName: 'October',
            posts: [post('public-article', 'published'), post('authoring-draft', 'draft')],
          },
        ],
      },
    ])
    const html = renderToStaticMarkup(await PostsPage())
    expect(html).toContain('/posts/2026/authoring-draft')
    expect(html).toContain('草稿')
  })
  it('never exposes a draft in the production index', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.mocked(getPostsByYearMonth).mockResolvedValue([
      {
        year: 2026,
        months: [
          {
            month: 10,
            monthName: 'October',
            posts: [post('public-article', 'published'), post('authoring-draft', 'draft')],
          },
        ],
      },
    ])
    const html = renderToStaticMarkup(await PostsPage())
    expect(html).toContain('/posts/2026/public-article')
    expect(html).not.toContain('authoring-draft')
    expect(html).toContain('共 1 篇已發佈文章')
  })
})
