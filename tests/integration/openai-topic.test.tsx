import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import OpenAIPage, { metadata } from '../../app/(frontend)/posts/openai/page'
import { getPosts } from '../../lib/posts/queries'
import { getPostHref } from '../../lib/site/writing'
import sitemap from '../../app/(frontend)/sitemap'

describe('OpenAI topic route', () => {
  it('renders published OpenAI news with their existing canonical article URLs', async () => {
    const posts = (await getPosts()).filter(
      (post) => post.status === 'published' && post.presentation?.category === 'OpenAI'
    )
    expect(posts.length).toBeGreaterThan(0)
    const doc = new DOMParser().parseFromString(
      renderToStaticMarkup(await OpenAIPage()),
      'text/html'
    )
    expect(doc.querySelector('h1')?.textContent).toBe('OpenAI')
    expect(
      [...doc.querySelectorAll('article h3 a')].map((link) => link.getAttribute('href'))
    ).toEqual(
      posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).map(getPostHref)
    )
    expect(doc.querySelector('a[href="/posts"]')).not.toBeNull()
    expect(metadata.alternates?.canonical).toBe('https://terry90918.github.io/posts/openai')
    expect((await sitemap()).map((entry) => entry.url)).toContain(
      'https://terry90918.github.io/posts/openai'
    )
  })
})
