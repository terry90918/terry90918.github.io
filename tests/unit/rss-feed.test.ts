/**
 * Unit tests for RSS feed generation
 *
 * TDD - RED phase: These tests define the expected RSS 2.0 XML structure.
 */

import { describe, it, expect } from 'vitest'
import { buildRssFeed } from '../../lib/rss'

interface Post {
  id: number
  title: string
  slug: string
  year: string
  excerpt?: string | null
  publishedAt?: string | null
}

describe('buildRssFeed()', () => {
  const siteUrl = 'https://terry90918.dev'
  const posts: Post[] = [
    {
      id: 1,
      title: 'Hello World',
      slug: 'hello-world',
      year: '2026',
      excerpt: 'A test post',
      publishedAt: '2026-04-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Second Post',
      slug: 'second-post',
      year: '2026',
      excerpt: null,
      publishedAt: '2026-03-15T00:00:00.000Z',
    },
  ]

  it('returns a string', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(typeof xml).toBe('string')
  })

  it('is valid XML starting with xml declaration', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml.startsWith('<?xml')).toBe(true)
  })

  it('contains rss version 2.0', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain('version="2.0"')
  })

  it('contains channel title', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain('<title>Terry Chen</title>')
  })

  it('contains channel link', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain(`<link>${siteUrl}</link>`)
  })

  it('contains channel description', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain('<description>')
  })

  it('contains an item for each post', () => {
    const xml = buildRssFeed(posts, siteUrl)
    const itemCount = (xml.match(/<item>/g) || []).length
    expect(itemCount).toBe(posts.length)
  })

  it('each item contains the post title', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain('<title>Hello World</title>')
    expect(xml).toContain('<title>Second Post</title>')
  })

  it('each item contains a link with year and slug', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain(`${siteUrl}/posts/2026/hello-world`)
    expect(xml).toContain(`${siteUrl}/posts/2026/second-post`)
  })

  it('includes pubDate for posts with publishedAt', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain('<pubDate>')
  })

  it('handles empty posts array', () => {
    const xml = buildRssFeed([], siteUrl)
    expect(xml).not.toContain('<item>')
    expect(xml).toContain('<channel>')
  })

  it('includes excerpt as description when available', () => {
    const xml = buildRssFeed(posts, siteUrl)
    expect(xml).toContain('<description>A test post</description>')
  })
})
