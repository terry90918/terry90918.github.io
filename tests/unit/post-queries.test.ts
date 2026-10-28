import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AliasPost, Post, PublishedPost } from '../../lib/posts/types'

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

const mockPost = (overrides: Partial<Omit<PublishedPost, 'status'>> = {}): PublishedPost => ({
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

const ALIAS_POST: AliasPost = {
  ...mockPost({ title: 'Merged Post', slug: 'oldest-alias' }),
  status: 'alias',
  canonicalSlug: 'oldest',
}

beforeEach(() => {
  vi.mocked(loadAllPosts).mockResolvedValue(POSTS)
})

describe('getPosts()', () => {
  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const posts = await getPosts()
    expect(posts).toEqual([])
  })

  it('keeps alias pages out of article listings', async () => {
    vi.mocked(loadAllPosts).mockResolvedValueOnce([...POSTS, ALIAS_POST])

    const posts = await getPosts()

    expect(posts).toEqual(POSTS)
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

  it('resolves an alias by its original slug', async () => {
    vi.mocked(loadAllPosts).mockResolvedValueOnce([...POSTS, ALIAS_POST])

    const post = await getPostBySlug('oldest-alias')

    expect(post).toMatchObject({ status: 'alias', canonicalSlug: 'oldest' })
  })
})

describe('getAllPostSlugs()', () => {
  it('returns the stored year and slug for every article', async () => {
    expect(await getAllPostSlugs()).toEqual([
      { year: '2026', slug: 'newest' },
      { year: '2026', slug: 'middle' },
      { year: '2025', slug: 'oldest' },
    ])
  })

  it('includes aliases so static export generates their redirect pages', async () => {
    vi.mocked(loadAllPosts).mockResolvedValueOnce([...POSTS, ALIAS_POST])

    const slugs = await getAllPostSlugs()

    expect(slugs).toContainEqual({ year: '2026', slug: 'oldest-alias' })
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

  it('does not use aliases as adjacent articles', async () => {
    vi.mocked(loadAllPosts).mockResolvedValueOnce([...POSTS, ALIAS_POST])

    const { prev, next } = await getAdjacentPosts('middle')

    expect(prev?.slug).toBe('oldest')
    expect(next?.slug).toBe('newest')
  })
})

describe('getPostsByYearMonth()', () => {
  it('groups articles into descending years and months with readable month names', async () => {
    expect(await getPostsByYearMonth()).toEqual([
      {
        year: 2026,
        months: [
          { month: 4, monthName: 'April', posts: [POSTS[0]] },
          { month: 3, monthName: 'March', posts: [POSTS[1]] },
        ],
      },
      {
        year: 2025,
        months: [{ month: 12, monthName: 'December', posts: [POSTS[2]] }],
      },
    ])
  })

  it('returns empty array on error', async () => {
    vi.mocked(loadAllPosts).mockRejectedValueOnce(new Error('fail'))
    const groups = await getPostsByYearMonth()
    expect(groups).toEqual([])
  })
})

describe('getAllTags()', () => {
  it('returns deduplicated tags in alphabetical order with article counts', async () => {
    expect(await getAllTags()).toEqual([
      { name: 'React', slug: 'react', count: 1 },
      { name: 'TypeScript', slug: 'typescript', count: 2 },
    ])
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
