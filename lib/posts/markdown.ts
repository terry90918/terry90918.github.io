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

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'audio', 'source'],
  attributes: {
    ...defaultSchema.attributes,
    audio: ['controls', 'preload', 'style', 'src'],
    source: ['src', 'type'],
  },
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

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(imagePerformance)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark-dimmed',
        light: 'github-light',
      },
    })
    .use(rehypeStringify)
    .process(content)

  return String(result)
}
