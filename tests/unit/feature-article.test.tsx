import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { FeatureArticle } from '../../components/article/FeatureArticle'
import type { Post } from '../../lib/posts/types'

it('presents the video before the mobile outline and article body', () => {
  const post: Post = {
    status: 'published',
    title: '測試文章',
    slug: 'preview',
    excerpt: '摘要',
    publishedAt: '2026-10-23T00:00:00Z',
    year: '2026',
    tags: [],
    readingTime: 1,
    html: '<h2 id="chapter">正文</h2>',
    rawContent: '## 正文',
    outline: [{ id: 'chapter', text: '正文' }],
  }
  const doc = new DOMParser().parseFromString(
    renderToStaticMarkup(
      <FeatureArticle
        post={post}
        presentation={{
          type: 'feature',
          video: { src: '/video.mp4', poster: '/poster.jpg', title: '影片摘要' },
        }}
        url="https://example.com/article"
      />
    ),
    'text/html'
  )
  const video = doc.querySelector('.feature-video')!
  const outline = doc.querySelector('.feature-mobile-outline')!
  const body = doc.querySelector('.feature-body')!
  expect(video.compareDocumentPosition(outline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(outline.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

it.each(['同一段摘要', '另外一段引言'])(
  'renders the excerpt once while retaining the opening quote: %s',
  (quote) => {
    const post: Post = {
      status: 'published',
      title: '測試文章',
      slug: 'preview',
      excerpt: '同一段摘要',
      publishedAt: '2026-10-28T00:00:00Z',
      year: '2026',
      tags: [],
      readingTime: 1,
      html: `<blockquote><p>${quote}</p></blockquote><h2>正文</h2>`,
      rawContent: `> ${quote}\n\n## 正文`,
    }
    const doc = new DOMParser().parseFromString(
      renderToStaticMarkup(
        <FeatureArticle
          post={post}
          presentation={{ type: 'feature' }}
          url="https://example.com/article"
        />
      ),
      'text/html'
    )
    expect(doc.body.textContent?.match(/同一段摘要/g)).toHaveLength(1)
    expect(doc.querySelector('.feature-body blockquote')?.textContent).toBe(quote)
  }
)
