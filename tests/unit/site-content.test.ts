import { describe, expect, it } from 'vitest'
import type { Post } from '../../lib/posts/types'
import { classifyPost, getPostHref, getRecentUpdates } from '../../lib/site/writing'

function post(slug: string, publishedAt: string, status: Post['status'] = 'published'): Post {
  return {
    title: slug,
    slug,
    publishedAt,
    status,
    tags: [],
    excerpt: '',
    readingTime: 1,
    html: '',
    rawContent: '',
    year: publishedAt.slice(0, 4),
  }
}

describe('Writing authorship labels', () => {
  it('identifies the Andrew Ng translation rather than presenting it as original opinion', () => {
    expect(
      classifyPost({
        slug: 'ai-engineering-skills-map-software-engineering-fundamentals',
        tags: [],
      })
    ).toBe('translation')
  })
  it('labels daily articles as the daily series', () => {
    expect(classifyPost({ slug: 'ai-daily-2026-10-06', tags: [] })).toBe('ai-daily')
  })
  it('does not infer original authorship from a new slug or an original tag', () => {
    expect(
      classifyPost({ slug: 'unverified-story', tags: [{ name: 'original', slug: 'original' }] })
    ).toBe('unclassified')
  })
})

describe('Homepage updates', () => {
  it('collapses a long daily series to its latest published article and excludes drafts', () => {
    const daily = Array.from({ length: 68 }, (_, i) =>
      post(`ai-daily-${i}`, new Date(Date.UTC(2026, 0, i + 1)).toISOString())
    )
    const input = [
      post('ai-daily-2026-10-07', '2026-10-07T00:00:00Z', 'draft'),
      ...daily,
      post('ai-daily-2026-10-06', '2026-10-06T00:00:00Z'),
    ]
    expect(getRecentUpdates(input).map((p) => p.slug)).toEqual(['ai-daily-2026-10-06'])
  })
  it('sorts real updates across years without mutating input and defaults to three entries', () => {
    const input = [
      post('old', '2025-01-01T00:00:00Z'),
      post('middle', '2026-03-01T00:00:00Z'),
      post('new', '2026-10-01T00:00:00Z'),
      post('older', '2024-01-01T00:00:00Z'),
    ]
    expect(getRecentUpdates(input).map((p) => p.slug)).toEqual(['new', 'middle', 'old'])
    expect(input.map((p) => p.slug)).toEqual(['old', 'middle', 'new', 'older'])
  })
  it('preserves the translation alongside a single daily item', () => {
    expect(
      getRecentUpdates([
        post('ai-daily-2026-10-05', '2026-10-05T00:00:00Z'),
        post('ai-engineering-skills-map-software-engineering-fundamentals', '2026-04-23T00:00:00Z'),
        post('ai-daily-2026-10-06', '2026-10-06T00:00:00Z'),
      ]).map((p) => p.slug)
    ).toEqual([
      'ai-daily-2026-10-06',
      'ai-engineering-skills-map-software-engineering-fundamentals',
    ])
  })
  it('leaves an empty or draft-only feed empty rather than inventing an update', () => {
    expect(getRecentUpdates([])).toEqual([])
    expect(getRecentUpdates([post('private', '2026-10-06T00:00:00Z', 'draft')])).toEqual([])
  })
  it('excludes unusable dates instead of rendering a false date', () => {
    expect(getRecentUpdates([post('bad-date', 'not-a-date')])).toEqual([])
  })
  it('honors a smaller limit and a zero limit', () => {
    const input = [post('first', '2026-10-06T00:00:00Z'), post('second', '2026-10-05T00:00:00Z')]
    expect(getRecentUpdates(input, 1).map((p) => p.slug)).toEqual(['first'])
    expect(getRecentUpdates(input, 0)).toEqual([])
  })
})

it('keeps each original year and slug when linking an article', () => {
  expect(getPostHref({ year: '2025', slug: 'existing-post' })).toBe('/posts/2025/existing-post')
})
