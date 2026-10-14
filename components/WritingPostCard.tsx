import Link from 'next/link'
import type { Post } from '@/lib/posts/types'
import { formatPublishedDate } from '@/lib/date'
import { classifyPost, getPostHref, getTranslationAuthor, WRITING_LABELS } from '@/lib/site/writing'

export function WritingPostCard({ post }: { post: Post }) {
  const kind = classifyPost(post)
  const translationAuthor = kind === 'translation' ? getTranslationAuthor(post.slug) : null
  return (
    <article data-writing-kind={kind} className="border-border min-w-0 border-b py-6 last:border-0">
      <p className="mb-2 text-xs leading-6 opacity-65">
        {WRITING_LABELS[kind]} · {formatPublishedDate(post.publishedAt, 'zh-TW')}
        {post.status === 'draft' && ' · 草稿（開發預覽）'}
        {translationAuthor && ` · 原文：${translationAuthor}`}
      </p>
      <Link
        href={getPostHref(post)}
        className="text-accent block rounded-sm text-lg leading-8 font-bold tracking-tight hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {post.title}
      </Link>
      {post.excerpt && (
        <p className="mt-3 line-clamp-2 text-sm leading-7 opacity-75">{post.excerpt}</p>
      )}
    </article>
  )
}
