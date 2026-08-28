import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Post } from './types'

interface MarkdownNode {
  type: string
  value?: string
  alt?: string
  children?: MarkdownNode[]
}

function markdownText(node: MarkdownNode): string {
  if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
    return node.value ?? ''
  }
  if (node.type === 'image') return node.alt ?? ''
  return (node.children ?? []).map(markdownText).join('')
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function hasLeadingExcerptBlockquote(post: Post): boolean {
  const tree = unified().use(remarkParse).parse(post.rawContent)
  const firstBlock = tree.children[0] as MarkdownNode | undefined
  if (firstBlock?.type !== 'blockquote') return false

  return normalizeText(markdownText(firstBlock)) === normalizeText(post.excerpt)
}
