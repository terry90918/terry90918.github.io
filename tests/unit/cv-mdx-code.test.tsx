import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'
import type { Root } from 'hast'
import MDXContent from '../../components/cv/mdx-content'

function markHeading() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === 'element' && node.tagName === 'h2') {
        node.children.push({ type: 'text', value: ' verified' })
      }
    }
  }
}

async function renderContent(props: Parameters<typeof MDXContent>[0]) {
  const element: ReactElement<MDXRemoteProps> = MDXContent(props)
  return new DOMParser().parseFromString(
    renderToStaticMarkup(await MDXRemote(element.props)),
    'text/html'
  )
}

const source = [
  '## Code sample',
  '',
  '{label}',
  '',
  '```typescript',
  'const greeting: string = "Hello"',
  'console.log(greeting)',
  '```',
].join('\n')

for (const locale of ['zh-TW', 'en'] as const) {
  describe(`CV MDX code in ${locale}`, () => {
    it('renders dual-theme Shiki tokens without imposing code backgrounds', async () => {
      const doc = await renderContent({
        source,
        locale,
        options: {
          scope: { label: locale === 'en' ? 'Example' : '範例' },
          mdxOptions: { rehypePlugins: [markHeading] },
        },
      })
      const code = doc.querySelector('pre code')
      expect(code?.textContent).toContain('const greeting: string = "Hello"')
      expect(code?.getAttribute('data-theme')).toContain('github-light')
      expect(code?.getAttribute('data-theme')).toContain('github-dark-dimmed')
      expect(doc.querySelectorAll('span[style*="--shiki-light:"]').length).toBeGreaterThan(1)
      expect(doc.querySelectorAll('span[style*="--shiki-dark:"]').length).toBeGreaterThan(1)
      expect(doc.querySelector('[data-rehype-pretty-code-figure]')).not.toBeNull()
      for (const node of doc.querySelectorAll('pre, pre code, pre span')) {
        expect(node.getAttribute('style') ?? '').not.toMatch(/background/i)
      }
      expect(doc.querySelector('h2')?.textContent).toBe('Code sample verified')
      expect(doc.querySelector('h2')?.id).toBe('code-sample-verified')
      expect(doc.body.textContent).toContain(locale === 'en' ? 'Example' : '範例')
    })
  })
}
