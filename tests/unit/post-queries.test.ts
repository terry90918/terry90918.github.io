import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Post } from '../../lib/posts/types'

vi.mock('../../lib/posts/loader', () => ({
  loadAllPosts: vi.fn(),
}))

import { loadAllPosts } from '../../lib/posts/loader'
import {
  getLatestPosts,
  getPostBySlug,
  getAllPostSlugs,
  getAdjacentPosts,
  getPostsByYearMonth,
  getAllTags,
  getPostsByTag,
  getPosts,
} from '../../lib/posts/queries'

const mockPost = (overrides: Partial<Post> = {}): Post => ({
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'Test excerpt',
  publishedAt: '2026-04-23T10:00:00+08:00',
  status: 'published',
  tags: [{ name: 'TypeScript', slug: 'typescript' }],
  readingTime: 3,
  html: '<p>Test</p>',
  rawContent: 'Test',
  year: '2026',
  ...overrides,
})

const POSTS: Post[] = [
  mockPost({ slug: 'newest', publishedAt: '2026-04-23T10:00:00Z', year: '2026' }),
  mockPost({
    slug: 'middle',
    publishedAt: '2026-03-15T10:00:00Z',
    year: '2026',
    tags: [{ name: 'React', slug: 'react' }],
  }),
  mockPost({
    slug: 'oldest',
    publishedAt: '2025-12-01T10:00:00Z',
    year: '2025',
    tags: [{ name: 'TypeScript', slug: 'typescript' }],
  }),
]

beforeEach(() => {
  vi.mocked(loadAllPosts).mockResolvedValue(POSTS)
})

describe('getPosts()', () => {
  it('returns all posts', async () => {
    const posts = await getPosts()
    expect(posts).toHaveLength(3)
  })

  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const posts = await getPosts()
    expect(posts).toEqual([])
  })
})

describe('getLatestPosts()', () => {
  it('returns the requested number of posts', async () => {
    const posts = await getLatestPosts(2)
    expect(posts).toHaveLength(2)
  })

  it('defaults to 3 posts', async () => {
    const posts = await getLatestPosts()
    expect(posts).toHaveLength(3)
  })

  it('returns fewer if not enough posts', async () => {
    vi.mocked(loadAllPosts).mockResolvedValueOnce([POSTS[0]])
    const posts = await getLatestPosts(10)
    expect(posts).toHaveLength(1)
  })
})

describe('getPostBySlug()', () => {
  it('returns the matching post', async () => {
    const post = await getPostBySlug('middle')
    expect(post).not.toBeNull()
    expect(post!.slug).toBe('middle')
  })

  it('returns null for unknown slug', async () => {
    const post = await getPostBySlug('nonexistent')
    expect(post).toBeNull()
  })

  it('returns null on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const post = await getPostBySlug('middle')
    expect(post).toBeNull()
  })
})

describe('getAllPostSlugs()', () => {
  it('returns year and slug pairs for all posts', async () => {
    const slugs = await getAllPostSlugs()
    expect(slugs).toHaveLength(3)
    expect(slugs[0]).toMatchObject({ year: expect.any(String), slug: expect.any(String) })
  })

  it('year matches publishedAt year', async () => {
    const slugs = await getAllPostSlugs()
    const newestEntry = slugs.find((s) => s.slug === 'newest')
    expect(newestEntry?.year).toBe('2026')
    const oldestEntry = slugs.find((s) => s.slug === 'oldest')
    expect(oldestEntry?.year).toBe('2025')
  })

  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const slugs = await getAllPostSlugs()
    expect(slugs).toEqual([])
  })
})

describe('getAdjacentPosts()', () => {
  it('newest post has no next', async () => {
    const { next } = await getAdjacentPosts('newest')
    expect(next).toBeNull()
  })

  it('oldest post has no prev', async () => {
    const { prev } = await getAdjacentPosts('oldest')
    expect(prev).toBeNull()
  })

  it('middle post has both prev and next', async () => {
    const { prev, next } = await getAdjacentPosts('middle')
    expect(prev).not.toBeNull()
    expect(next).not.toBeNull()
  })

  it('returns null/null for unknown slug', async () => {
    const result = await getAdjacentPosts('nonexistent')
    expect(result).toEqual({ prev: null, next: null })
  })
})

describe('getPostsByYearMonth()', () => {
  it('groups posts by year', async () => {
    const groups = await getPostsByYearMonth()
    const years = groups.map((g) => g.year)
    expect(years).toContain(2026)
    expect(years).toContain(2025)
  })

  it('sorts years newest first', async () => {
    const groups = await getPostsByYearMonth()
    expect(groups[0].year).toBeGreaterThan(groups[1].year)
  })

  it('each year contains months array', async () => {
    const groups = await getPostsByYearMonth()
    for (const group of groups) {
      expect(Array.isArray(group.months)).toBe(true)
      for (const month of group.months) {
        expect(month).toHaveProperty('month')
        expect(month).toHaveProperty('monthName')
        expect(month).toHaveProperty('posts')
      }
    }
  })

  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const groups = await getPostsByYearMonth()
    expect(groups).toEqual([])
  })
})

describe('getAllTags()', () => {
  it('returns deduplicated tags', async () => {
    const tags = await getAllTags()
    const slugs = tags.map((t) => t.slug)
    const uniqueSlugs = [...new Set(slugs)]
    expect(slugs).toHaveLength(uniqueSlugs.length)
  })

  it('returns TypeScript tag with count 2', async () => {
    const tags = await getAllTags()
    const ts = tags.find((t) => t.slug === 'typescript')
    expect(ts).toBeDefined()
    expect(ts!.count).toBe(2)
  })

  it('returns React tag with count 1', async () => {
    const tags = await getAllTags()
    const react = tags.find((t) => t.slug === 'react')
    expect(react).toBeDefined()
    expect(react!.count).toBe(1)
  })

  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const tags = await getAllTags()
    expect(tags).toEqual([])
  })
})

describe('getPostsByTag()', () => {
  it('returns posts with matching tag slug', async () => {
    const posts = await getPostsByTag('typescript')
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.every((p) => p.tags.some((t) => t.slug === 'typescript'))).toBe(true)
  })

  it('returns empty array for unknown tag', async () => {
    const posts = await getPostsByTag('nonexistent-tag-xyz')
    expect(posts).toEqual([])
  })

  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const posts = await getPostsByTag('typescript')
    expect(posts).toEqual([])
  })
})
