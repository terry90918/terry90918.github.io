import Link from 'next/link'
import type { Post } from '@/lib/posts/types'
import { formatPublishedDate } from '@/lib/date'
import { classifyPost, getPostHref, WRITING_LABELS } from '@/lib/site/writing'

export function WritingPostCard({ post }: { post: Post }) {
  const kind = classifyPost(post)
  return (
    <article data-writing-kind={kind} className="border-border border-b py-4 last:border-0">
      <p className="mb-1 text-xs opacity-65">
        {WRITING_LABELS[kind]} · {formatPublishedDate(post.publishedAt, 'zh-TW')}
        {kind === 'translation' && ' · 原文：Andrew Ng'}
      </p>
      <Link
        href={getPostHref(post)}
        className="text-accent block rounded-sm leading-7 font-bold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {post.title}
      </Link>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-75">{post.excerpt}</p>
      )}
    </article>
  )
}
