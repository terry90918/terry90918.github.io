import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatPublishedDate } from '@/lib/date'
import type { FeaturePresentation, Post } from '@/lib/posts/types'
import { ArticleAudioBar } from './ArticleAudioBar'
import { ArticleOutline } from './ArticleOutline'

export function FeatureArticle({
  post,
  presentation,
  prev,
  next,
  url,
}: {
  post: Post
  presentation: FeaturePresentation
  prev?: Post | null
  next?: Post | null
  url: string
}) {
  const headings = post.outline ?? []
  return (
    <article className="feature-article">
      <header className="feature-hero">
        <div className="feature-meta">
          <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt, 'zh-TW')}</time>
          <span>{presentation.category ?? '文章'}</span>
        </div>
        <h1>{post.title}</h1>
        <p className="feature-subtitle">{post.excerpt}</p>
        <ArticleAudioBar audio={presentation.audio} url={url} />
      </header>
      <div className="feature-reading-grid">
        <aside className="feature-desktop-outline">
          <ArticleOutline headings={headings} />
        </aside>
        <div className="feature-reading-stream">
          <ArticleOutline headings={headings} mobile />
          {presentation.video && (
            <figure className="feature-video">
              <div className="feature-video-stage">
                <video
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload="none"
                  poster={presentation.video.poster}
                  aria-label={presentation.video.title}
                >
                  <source src={presentation.video.src} type="video/mp4" />
                  您的瀏覽器不支援影片播放。
                </video>
              </div>
              <figcaption>
                {presentation.video.title}
                <span>NotebookLM 影片摘要</span>
              </figcaption>
            </figure>
          )}
          <div
            className="feature-body typeset typeset-docs mx-auto max-w-[37em]"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <footer className="feature-article-footer">
            <p>
              作者 <Link href="/about">Terry Chen</Link>
            </p>
            <div className="feature-tags">
              {post.tags.map((tag) => (
                <Badge variant="outline" key={tag.slug}>
                  {tag.name}
                </Badge>
              ))}
            </div>
            <nav className="feature-adjacent" aria-label="其他文章">
              {prev && <Link href={`/posts/${prev.year}/${prev.slug}`}>← {prev.title}</Link>}
              {next && <Link href={`/posts/${next.year}/${next.slug}`}>{next.title} →</Link>}
            </nav>
          </footer>
        </div>
      </div>
    </article>
  )
}
