import { describe, it, expect } from 'vitest'
import { renderMarkdown, renderMarkdownWithOutline } from '../../lib/posts/markdown'

describe('renderMarkdown()', () => {
  it('returns an outline matching rendered heading IDs and readable text', async () => {
    const rendered = await renderMarkdownWithOutline(
      '## 同步與 **取消**\n\n## 同步與 **取消**\n\n### 細節\n\n## A & B'
    )
    expect(rendered.outline).toEqual([
      { id: '同步與-取消', text: '同步與 取消' },
      { id: '同步與-取消-1', text: '同步與 取消' },
      { id: 'a--b', text: 'A & B' },
    ])
    for (const item of rendered.outline) expect(rendered.html).toContain(`id="${item.id}"`)
  })

  it('prioritizes only the first image and defers later images without changing their text', async () => {
    const html = await renderMarkdown(
      '![First](https://example.com/first.webp)\n\n![Second](https://example.com/second.webp)'
    )
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const images = [...doc.querySelectorAll('img')]
    expect(images.map((image) => image.getAttribute('loading'))).toEqual(['eager', 'lazy'])
    expect(images.map((image) => image.getAttribute('decoding'))).toEqual(['async', 'async'])
    expect(images[0].getAttribute('fetchpriority')).toBe('high')
    expect(images[1].alt).toBe('Second')
  })
  it('renders headings', async () => {
    const html = await renderMarkdown('# Hello\n\n## World')
    expect(html).toContain('<h1')
    expect(html).toContain('<h2')
    expect(html).toContain('Hello')
    expect(html).toContain('World')
  })

  it('renders paragraphs', async () => {
    const html = await renderMarkdown('Hello world')
    expect(html).toContain('<p>')
    expect(html).toContain('Hello world')
  })

  it('renders bold and italic', async () => {
    const html = await renderMarkdown('**bold** and *italic*')
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')
  })

  it('renders links', async () => {
    const html = await renderMarkdown('[Link](https://example.com)')
    expect(html).toContain('<a')
    expect(html).toContain('href')
    expect(html).toContain('https://example.com')
  })

  it('renders GFM table', async () => {
    const table = '| Col1 | Col2 |\n|------|------|\n| a | b |'
    const html = await renderMarkdown(table)
    expect(html).toContain('<table>')
    expect(html).toContain('<thead>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('<td>')
  })

  it('renders GFM task list', async () => {
    const tasks = '- [ ] unchecked\n- [x] checked'
    const html = await renderMarkdown(tasks)
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
  })

  it('adds id attribute to headings', async () => {
    const html = await renderMarkdown('## Installation Guide')
    expect(html).toContain('id="installation-guide"')
  })

  it('gives CJK headings a non-empty id', async () => {
    const html = await renderMarkdown('## 安裝指南')
    const idMatch = html.match(/id="([^"]+)"/)
    expect(idMatch).toBeTruthy()
    expect(idMatch![1].length).toBeGreaterThan(0)
  })

  it('renders fenced code block without throwing', async () => {
    const code = '```typescript\nconst x: number = 1\n```'
    const html = await renderMarkdown(code)
    expect(html).toContain('<pre')
    expect(html).toContain('<code')
  })

  it('does not throw for unknown language in code block', async () => {
    const code = '```unknownlang9999\nsome code here\n```'
    await expect(renderMarkdown(code)).resolves.toContain('<pre')
  })

  it('returns a string', async () => {
    const result = await renderMarkdown('Hello')
    expect(typeof result).toBe('string')
  })

  it('returns empty string for empty input', async () => {
    const result = await renderMarkdown('')
    expect(typeof result).toBe('string')
  })

  it('preserves <audio>/<source> tags used for podcast embeds', async () => {
    const markdown =
      '<audio controls controlslist="nodownload" preload="none">\n  <source src="/audio/2026/example.mp3" type="audio/mpeg">\n</audio>'
    const html = await renderMarkdown(markdown)
    expect(html).toContain('<audio')
    expect(html).toContain('controlslist="nodownload"')
    expect(html).toContain('<source src="/audio/2026/example.mp3" type="audio/mpeg">')
  })

  it('preserves video playback controls while removing executable attributes', async () => {
    const html = await renderMarkdown(
      '<video controls controlslist="nodownload" preload="none" playsinline width="360" poster="/video/poster.jpg" style="max-width: 100%; height: auto;" onplay="alert(1)"><source src="/video/example.mp4" type="video/mp4"></video>'
    )
    expect(html).toContain('<video')
    expect(html).toContain('controlslist="nodownload"')
    expect(html).toContain('controls')
    expect(html).toContain('preload="none"')
    expect(html).toContain('playsinline')
    expect(html).toContain('width="360"')
    expect(html).toContain('poster="/video/poster.jpg"')
    expect(html).toContain('<source src="/video/example.mp4" type="video/mp4">')
    expect(html).not.toContain('onplay')
    expect(html).not.toContain('alert(1)')
    const unsafe = await renderMarkdown(
      '<video poster="javascript:alert(1)" src="javascript:alert(2)"></video>'
    )
    expect(unsafe).not.toContain('javascript:')
  })

  it('strips disallowed raw HTML such as <script>', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>\n\nHello')
    expect(html).not.toContain('<script')
  })
})

it('keeps wide markdown tables in a keyboard-accessible scroll region', async () => {
  const html = await renderMarkdown('| Name | Value |\n| --- | --- |\n| One | Two |')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const table = doc.querySelector('table')!
  expect(table.parentElement?.className).toBe('typeset-scroll')
  expect(table.parentElement?.getAttribute('role')).toBe('region')
  expect(table.parentElement?.getAttribute('tabindex')).toBe('0')
  expect(table.getAttribute('class')).toBeNull()
})
