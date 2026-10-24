import type { Post } from '@/lib/posts/types'

export const WRITING_SERIES = {
  pstack: {
    title: 'pstack',
    description:
      'pstack 的技能、工作流程與版本更新解讀，整理 AI Agent 開發時的任務校準、驗證與交接。',
    slugPrefix: 'cursor-pstack-',
  },
  harness2: {
    title: 'Harness²',
    description: 'Harness² 深度導讀，從核心概念、原始碼流程到實際試跑與評估限制。',
    slugPrefix: 'harness2-recursive-agent-harnessing-',
  },
}

export type WritingSeries = keyof typeof WRITING_SERIES

export function getSeriesPosts(posts: readonly Post[], series: WritingSeries): Post[] {
  return posts
    .filter(
      (post) =>
        post.status === 'published' && post.slug.startsWith(WRITING_SERIES[series].slugPrefix)
    )
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
