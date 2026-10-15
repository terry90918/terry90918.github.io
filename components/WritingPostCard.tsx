import Link from 'next/link'
import type { Post } from '@/lib/posts/types'
import { formatPublishedDate } from '@/lib/date'
import { classifyPost, getPostHref, getTranslationAuthor, WRITING_LABELS } from '@/lib/site/writing'

export function WritingPostCard({ post }: { post: Post }) {
  const kind = classifyPost(post)
  const translationAuthor = kind === 'translation' ? getTranslationAuthor(post.slug) : null
  return (
    <article data-writing-kind={kind} className="site-writing-row">
      <p className="site-writing-meta">
        <span className="site-badge">{WRITING_LABELS[kind]}</span>
        <span>
          {formatPublishedDate(post.publishedAt, 'zh-TW')}
          {post.status === 'draft' && ' · 草稿（開發預覽）'}
        </span>
        {translationAuthor && <span>原文：{translationAuthor}</span>}
      </p>
      <h3>
        <Link href={getPostHref(post)}>{post.title}</Link>
      </h3>
      {post.excerpt && <p className="site-writing-excerpt">{post.excerpt}</p>}
    </article>
  )
}
