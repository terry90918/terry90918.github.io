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

// Extends the default sanitize schema (which already covers headings, links,
// code blocks, etc.) to allow the <audio>/<source> tags used for podcast
// embeds, while still stripping <script> and other unsafe raw HTML.
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'audio', 'source'],
  attributes: {
    ...defaultSchema.attributes,
    audio: ['controls', 'preload', 'style', 'src'],
    source: ['src', 'type'],
  },
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
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
