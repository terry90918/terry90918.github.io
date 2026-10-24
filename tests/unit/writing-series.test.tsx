import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Post, PublishedPost } from '../../lib/posts/types'
import { getSeriesPosts } from '../../lib/site/writing-series'
import WritingSeriesPage from '../../components/WritingSeriesPage'

vi.mock('@/lib/posts/queries', () => ({ getPosts: vi.fn() }))
import { getPosts } from '../../lib/posts/queries'

function post(slug: string, publishedAt = '2026-10-19T00:00:00Z'): PublishedPost {
  return {
    slug,
    title: slug,
    status: 'published',
    publishedAt,
    year: '2026',
    tags: [],
    excerpt: '',
    readingTime: 1,
    html: '',
    rawContent: '',
  }
}

const posts: Post[] = [
  post('cursor-pstack-plugin-analysis'),
  post('harness2-recursive-agent-harnessing-01'),
  post('cursor-pstack-01526-01530-updates', '2026-10-22T00:00:00Z'),
  { ...post('cursor-pstack-future'), status: 'draft' },
  { ...post('cursor-pstack-old'), status: 'alias', canonicalSlug: 'cursor-pstack-plugin-analysis' },
  post('harness-engineering-agent-reliability'),
  post('ai-daily-2026-10-19'),
]

afterEach(() => vi.resetAllMocks())

describe('Writing series', () => {
  it('lists only published series members in reverse publication order without changing the input', () => {
    expect(getSeriesPosts(posts, 'pstack').map((post) => post.slug)).toEqual([
      'cursor-pstack-01526-01530-updates',
      'cursor-pstack-plugin-analysis',
    ])
    expect(getSeriesPosts(posts, 'harness2').map((post) => post.slug)).toEqual([
      'harness2-recursive-agent-harnessing-01',
    ])
    expect(posts[0].slug).toBe('cursor-pstack-plugin-analysis')
  })
  for (const [series, title, count] of [
    ['pstack', 'pstack', 2],
    ['harness2', 'Harness²', 1],
  ] as const) {
    it(`renders the ${title} archive with canonical article links`, async () => {
      vi.mocked(getPosts).mockResolvedValue(posts)
      const doc = new DOMParser().parseFromString(
        renderToStaticMarkup(await WritingSeriesPage({ series })),
        'text/html'
      )
      expect(doc.querySelector('h1')?.textContent).toBe(title)
      expect(doc.body.textContent).toContain(`共 ${count} 篇已發佈文章`)
      expect(doc.querySelector('a[href="/posts"]')).not.toBeNull()
      expect(
        [...doc.querySelectorAll('article h2 a, article h3 a')].map((a) => a.getAttribute('href'))
      ).toEqual(getSeriesPosts(posts, series).map((post) => `/posts/${post.year}/${post.slug}`))
      expect(doc.body.textContent).not.toMatch(/future|old|ai-daily|harness-engineering/)
    })
  }
  it('shows a usable empty series page', async () => {
    vi.mocked(getPosts).mockResolvedValue([])
    const html = renderToStaticMarkup(await WritingSeriesPage({ series: 'pstack' }))
    expect(html).toContain('目前沒有已發佈文章。')
    expect(html).toContain('回到全部文章')
  })
})
