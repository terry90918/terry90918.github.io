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

  it('renders the channel and published article fields as valid RSS XML', () => {
    const xml = buildRssFeed(posts, siteUrl)
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.documentElement.tagName).toBe('rss')
    expect(doc.documentElement.getAttribute('version')).toBe('2.0')
    expect(doc.querySelector('channel > title')?.textContent).toBe('Terry Chen')
    expect(doc.querySelector('channel > link')?.textContent).toBe(siteUrl)
    expect(doc.querySelector('channel > description')?.textContent).toBeTruthy()
    expect(
      [...doc.querySelectorAll('item')].map((item) => ({
        title: item.querySelector('title')?.textContent,
        link: item.querySelector('link')?.textContent,
        guid: item.querySelector('guid')?.textContent,
        description: item.querySelector('description')?.textContent,
        publishedAt: item.querySelector('pubDate')?.textContent,
      }))
    ).toEqual([
      {
        title: 'Hello World',
        link: `${siteUrl}/posts/2026/hello-world`,
        guid: `${siteUrl}/posts/2026/hello-world`,
        description: 'A test post',
        publishedAt: 'Wed, 01 Apr 2026 00:00:00 GMT',
      },
      {
        title: 'Second Post',
        link: `${siteUrl}/posts/2026/second-post`,
        guid: `${siteUrl}/posts/2026/second-post`,
        description: '',
        publishedAt: 'Sun, 15 Mar 2026 00:00:00 GMT',
      },
    ])
  })

  it('handles empty posts array', () => {
    const xml = buildRssFeed([], siteUrl)
    expect(xml).not.toContain('<item>')
    expect(xml).toContain('<channel>')
  })
})
