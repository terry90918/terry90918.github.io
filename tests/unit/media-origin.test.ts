import { expect, it } from 'vitest'
import { renderMarkdown } from '../../lib/posts/markdown'
import { readPresentation } from '../../lib/posts/presentation'

const origin = 'https://terry-blog-prod-public-media.nbg1.your-objectstorage.com'
const src = `${origin}/videos/2026/${'a'.repeat(64)}.mp4`
const poster = `${origin}/posters/2026/${'b'.repeat(64)}.jpg`

it('accepts immutable video and poster URLs on the dedicated public media origin', () => {
  const video = { src, poster, title: '影片摘要' }
  expect(readPresentation({ type: 'feature', video })?.video).toEqual(video)
})

it.each([
  src.replace('https:', 'http:'),
  src.replace('terry-blog-prod-public-media', 'jurislm-prod'),
  src.replace('terry-blog-prod-public-media', 'terry90918-public-media'),
  src.replace('https://', 'https://user:secret@'),
  `${src}?token=secret`,
  `${src}#fragment`,
  src.replace('/videos/', '/private/'),
  src.replace('a'.repeat(64), 'latest'),
])('rejects video URLs outside the public immutable media contract: %s', (value) => {
  expect(() =>
    readPresentation({ type: 'feature', video: { src: value, poster, title: '影片摘要' } })
  ).toThrow('presentation.video.src')
})

it('applies the same dedicated origin restriction to posters', () => {
  expect(() =>
    readPresentation({
      type: 'feature',
      video: {
        src,
        poster: poster.replace('terry-blog-prod-public-media', 'jurislm-prod'),
        title: '影片摘要',
      },
    })
  ).toThrow('presentation.video.poster')
})

it('enforces the same bucket contract for raw Markdown video, poster and source', async () => {
  const old = src.replace('terry-blog-prod-public-media', 'terry90918-public-media')
  const otherPoster = poster.replace('terry-blog-prod-public-media', 'jurislm-prod')
  const cases = [
    [`<video src="${old}"></video>`, 'src'],
    [`<video poster="${otherPoster}"><source src="${src}"></video>`, 'poster'],
    [`<video><source src="${old.replace('https://', '//')}"></video>`, 'src'],
    [`<video><source src="${src.replace('/videos/', '/private/')}"></video>`, 'src'],
  ]
  for (const [input, field] of cases) {
    await expect(renderMarkdown(input)).rejects.toThrow(`article video ${field}`)
  }
})

it('renders canonical bucket assets and preserves existing non-bucket media', async () => {
  const external = 'https://example.com/stock.mp4'
  const input = `<video poster="${poster}"><source src="${src}"></video> <video src="${external}"></video>`
  const html = await renderMarkdown(input)
  expect(html).toContain(`poster="${poster}"`)
  expect(html).toContain(`src="${src}"`)
  expect(html).toContain(`src="${external}"`)
})
