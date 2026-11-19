import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Root, Element } from 'hast'
import { readPublishedVideoAsset } from './presentation'
import type { ArticleHeading } from './types'

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'audio', 'video', 'source'],
  attributes: {
    ...defaultSchema.attributes,
    audio: ['controls', 'controlsList', 'preload', 'style', 'src'],
    video: [
      'controls',
      'controlsList',
      'preload',
      'playsInline',
      'width',
      'style',
      'poster',
      'src',
    ],
    source: ['src', 'type'],
  },
  protocols: {
    ...defaultSchema.protocols,
    poster: ['http', 'https'],
  },
}

function checkBucketVideoAssets() {
  function check(value: unknown, kind: 'src' | 'poster') {
    if (typeof value !== 'string') return
    let hostname: string
    try {
      hostname = new URL(value, 'https://example.invalid').hostname.replace(/\.$/, '')
    } catch {
      return
    }
    if (hostname === 'your-objectstorage.com' || hostname.endsWith('.your-objectstorage.com')) {
      readPublishedVideoAsset(value, kind, `article video ${kind}`)
    }
  }

  return (tree: Root) => {
    const scan = (node: Root | Element, inVideo = false) => {
      if (node.type === 'element') {
        if (node.tagName === 'video') {
          check(node.properties.src, 'src')
          check(node.properties.poster, 'poster')
          inVideo = true
        } else if (node.tagName === 'source' && inVideo) {
          check(node.properties.src, 'src')
        }
      }
      for (const child of node.children) {
        if (child.type === 'element') scan(child, inVideo)
      }
    }
    scan(tree)
  }
}

function imagePerformance() {
  return async (tree: Root) => {
    const images: Element[] = []
    const scan = (node: Root | Element | Root['children'][number]) => {
      if (node.type === 'element' && node.tagName === 'img') images.push(node)
      if ('children' in node) node.children.forEach(scan)
    }
    scan(tree)
    if (!images.length) return
    const json = await readFile(
      path.join(process.cwd(), 'public/image-variants/manifest.json'),
      'utf8'
    ).catch((error) => {
      if (error.code === 'ENOENT') return '{}'
      throw error
    })
    const manifest = JSON.parse(json) as Record<
      string,
      { width: number; height: number; srcSet: string }
    >
    images.forEach((image, index) => {
      image.properties.loading = index === 0 ? 'eager' : 'lazy'
      image.properties.decoding = 'async'
      if (index === 0) image.properties.fetchPriority = 'high'
      const source = image.properties.src
      const metadata = typeof source === 'string' ? manifest[source] : undefined
      if (metadata) {
        image.properties.width = metadata.width
        image.properties.height = metadata.height
        if (metadata.srcSet) {
          image.properties.srcSet = metadata.srcSet
          image.properties.sizes = '(max-width: 768px) calc(100vw - 64px), 704px'
        }
      }
    })
  }
}

function scrollTables() {
  return (tree: Root) => {
    const scan = (node: Root | Element) => {
      node.children = node.children.map((child) => {
        if (child.type !== 'element') return child
        scan(child)
        if (child.tagName !== 'table') return child
        return {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['typeset-scroll'],
            role: 'region',
            ariaLabel: '表格',
            tabIndex: 0,
          },
          children: [child],
        } satisfies Element
      })
    }
    scan(tree)
  }
}

function headingText(node: Root['children'][number]): string {
  if (node.type === 'text') return node.value
  if (node.type === 'element') return node.children.map(headingText).join('')
  return ''
}

export async function renderMarkdownWithOutline(content: string): Promise<{
  html: string
  outline: ArticleHeading[]
}> {
  const outline: ArticleHeading[] = []
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(checkBucketVideoAssets)
    .use(imagePerformance)
    .use(rehypeSlug)
    .use(() => (tree: Root) => {
      const scan = (node: Root | Root['children'][number]) => {
        if (
          node.type === 'element' &&
          node.tagName === 'h2' &&
          typeof node.properties.id === 'string'
        ) {
          outline.push({ id: node.properties.id, text: headingText(node) })
        }
        if ('children' in node) node.children.forEach(scan)
      }
      scan(tree)
    })
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark-dimmed',
        light: 'github-light',
      },
    })
    .use(scrollTables)
    .use(rehypeStringify)
    .process(content)

  return { html: String(result), outline }
}

export async function renderMarkdown(content: string): Promise<string> {
  return (await renderMarkdownWithOutline(content)).html
}
