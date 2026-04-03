import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/payload'
import { ArticleCard } from '@/components/ArticleCard'
import type { Article, Tag, Media as MediaType } from '@/payload-types'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

function getFeatureImageUrl(post: Article): string | null {
  if (!post.featureImage) return null
  if (typeof post.featureImage === 'object' && post.featureImage.url) {
    return post.featureImage.url
  }
  return null
}

function getPopulatedTags(post: Article): Tag[] {
  if (!post.tags) return []
  return post.tags.filter((t): t is Tag => typeof t === 'object')
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: '找不到文章 | 劉尹惠律師事務所',
    }
  }

  const featureImageUrl = getFeatureImageUrl(post)

  return {
    title: `${post.title} | 劉尹惠律師事務所`,
    description: post.excerpt ?? post.metaDescription ?? '',
    openGraph: {
      title: post.title,
      description: post.excerpt ?? post.metaDescription ?? '',
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      tags: getPopulatedTags(post).map((t) => t.name),
      images: featureImageUrl
        ? [
            {
              url: featureImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? post.metaDescription ?? '',
      images: featureImageUrl ? [featureImageUrl] : undefined,
    },
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const tags = getPopulatedTags(post)
  const tagIds = tags.map((t) => t.id)
  const relatedPosts = await getRelatedPosts(slug, tagIds, 3)

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const featureImageUrl = getFeatureImageUrl(post)
  const featureImage =
    typeof post.featureImage === 'object' ? (post.featureImage as MediaType) : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? post.metaDescription,
    image: featureImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: '劉尹惠律師',
    },
    publisher: {
      '@type': 'Organization',
      name: '劉尹惠律師事務所',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lawyer.jurislm.com/logo.png',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background-light dark:bg-background-dark min-h-screen">
        {/* Back Navigation */}
        <div className="mx-auto max-w-4xl px-6 pt-8 md:px-12">
          <Link
            href="/articles"
            className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            返回文章列表
          </Link>
        </div>

        {/* Hero */}
        <header className="pt-4">
          {featureImageUrl && featureImage && (
            <div className="relative h-[40vh] overflow-hidden md:h-[50vh]">
              <Image
                src={featureImageUrl}
                alt={featureImage.alt ?? post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="from-background-light dark:from-background-dark via-background-light/20 dark:via-background-dark/20 absolute inset-0 bg-gradient-to-t to-transparent" />
            </div>
          )}

          <div className="mx-auto max-w-4xl px-6 py-12 md:px-12">
            {/* Tags & Date */}
            <div className="animate-fade-up mb-6 flex flex-wrap items-center gap-3">
              {tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 py-1 text-sm transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
              <span className="text-text-muted text-sm">{formattedDate}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-text-dark dark:text-text-light animate-fade-up mb-6 text-3xl leading-tight [animation-delay:100ms] md:text-5xl">
              {post.title}
            </h1>

            {/* Author */}
            <div className="animate-fade-up flex items-center gap-3 [animation-delay:200ms]">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div>
                <p className="text-text-dark dark:text-text-light text-sm font-medium">
                  劉尹惠律師
                </p>
                <p className="text-text-muted text-xs">作者</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-4xl px-6 pb-24 md:px-12">
          <article className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:tracking-wide prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-blockquote:border-primary/40 prose-blockquote:italic prose-code:rounded prose-code:px-2 prose-code:py-0.5 prose-code:text-sm prose-code:bg-text-dark/10 dark:prose-code:bg-text-light/10 prose-pre:p-4 prose-pre:rounded-lg prose-img:rounded-lg prose-ul:list-disc prose-ol:list-decimal max-w-none">
            <RichText data={post.content} />
          </article>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="border-text-dark/20 dark:border-text-light/20 mt-12 border-t pt-8">
              <p className="text-text-muted mb-3 text-sm">相關標籤</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tag=${tag.slug}`}
                    className="bg-text-dark/10 dark:bg-text-light/10 text-text-dark dark:text-text-light hover:bg-text-dark/20 dark:hover:bg-text-light/20 rounded-full px-3 py-1 text-sm transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="border-text-dark/20 dark:border-text-light/20 mt-8 border-t pt-8">
            <p className="text-text-muted mb-3 text-sm">分享文章</p>
            <div className="flex gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://lawyer.jurislm.com/articles/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
              >
                Facebook
              </a>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://lawyer.jurislm.com/articles/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#00B900] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
              >
                LINE
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 mt-12 rounded-2xl bg-gradient-to-br p-8 text-center">
            <h3 className="font-display text-text-dark dark:text-text-light mb-3 text-xl">
              需要法律諮詢嗎？
            </h3>
            <p className="text-text-dark dark:text-text-light mb-6">
              如果您有相關的法律問題，歡迎預約諮詢
            </p>
            <a
              href="https://lin.ee/nicHsmR"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-6 py-3 text-white transition-colors"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              預約諮詢
            </a>
          </div>
        </main>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-text-dark/20 dark:border-text-light/20 border-t px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="font-display text-text-dark dark:text-text-light mb-8 text-2xl">
                相關文章
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <ArticleCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-text-dark/20 dark:border-text-light/20 border-t px-6 py-8 md:px-12">
          <div className="text-text-muted mx-auto max-w-7xl text-center text-sm">
            <p>&copy; {new Date().getFullYear()} 劉尹惠律師事務所. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
