import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../../lib/posts/markdown'

describe('renderMarkdown()', () => {
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
      '<audio controls preload="none">\n  <source src="/audio/2026/example.mp3" type="audio/mpeg">\n</audio>'
    const html = await renderMarkdown(markdown)
    expect(html).toContain('<audio')
    expect(html).toContain('<source src="/audio/2026/example.mp3" type="audio/mpeg">')
  })

  it('strips disallowed raw HTML such as <script>', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>\n\nHello')
    expect(html).not.toContain('<script')
  })
})
