import type { Post } from '@/lib/posts/types'

export const WRITING_SERIES = {
  openai: {
    title: 'OpenAI',
    description: 'OpenAI 官方消息、產品更新與研究進展，整理使用條件、評測範圍與實際應用的限制。',
    category: 'OpenAI',
  },
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
  const topic = WRITING_SERIES[series]
  return posts
    .filter(
      (post) =>
        post.status === 'published' &&
        ('category' in topic
          ? post.presentation?.category === topic.category
          : post.slug.startsWith(topic.slugPrefix))
    )
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
