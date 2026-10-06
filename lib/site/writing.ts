import type { Post } from '@/lib/posts/types'

export type WritingKind = 'original' | 'translation' | 'ai-daily' | 'unclassified'

// Only articles explicitly reviewed as Terry's own stories belong here.
export const ORIGINAL_STORY_SLUGS: readonly string[] = []
const translationSlug = 'ai-engineering-skills-map-software-engineering-fundamentals'

export const WRITING_LABELS: Record<WritingKind, string> = {
  original: '原創',
  translation: '翻譯',
  'ai-daily': 'AI 日報',
  unclassified: '文章',
}

export function classifyPost(post: Pick<Post, 'slug' | 'tags'>): WritingKind {
  if (post.slug === translationSlug) return 'translation'
  if (post.slug.startsWith('ai-daily-')) return 'ai-daily'
  if (ORIGINAL_STORY_SLUGS.includes(post.slug)) return 'original'
  return 'unclassified'
}

export function getRecentUpdates(posts: readonly Post[], limit = 3): Post[] {
  const count = Math.max(0, Math.floor(limit))
  if (count === 0) return []
  const published = posts
    .filter((post) => post.status === 'published' && Number.isFinite(Date.parse(post.publishedAt)))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  let hasDaily = false
  return published
    .filter((post) => {
      if (classifyPost(post) !== 'ai-daily') return true
      if (hasDaily) return false
      hasDaily = true
      return true
    })
    .slice(0, count)
}

export function getPostHref(post: Pick<Post, 'year' | 'slug'>): string {
  return `/posts/${post.year}/${post.slug}`
}
