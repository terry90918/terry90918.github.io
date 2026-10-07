export function generateSlug(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}
export function extractHeadings(content: string): {
  slug: string
  text: string
  depth: number
}[] {
  return [...content.matchAll(/^(#{2,6})\s+(.+)$/gm)].map((match) => ({
    slug: generateSlug(match[2]),
    text: match[2].trim(),
    depth: match[1].length - 2,
  }))
}
