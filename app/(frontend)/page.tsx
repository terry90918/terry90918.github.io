import Link from 'next/link'
import { getPosts } from '@/lib/posts/queries'
import { EXPERIENCE_NOTES, SITE_EMAIL, WORK_CASES, WORK_CATEGORY_LABELS } from '@/lib/site/content'
import { getRecentUpdates } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'
import { SiteContact } from '@/components/SiteContact'
import { SiteEyebrow, SitePortrait, SiteSectionHeading } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  'Terry Chen',
  '認識 Terry：幾段產品與工程經歷、精選作品，以及最近整理的 AI 日報。',
  '/'
)

export default async function HomePage() {
  const updates = getRecentUpdates(await getPosts())
  return (
    <div data-testid="homepage-inner" className="site-page">
      <section
        data-home-section="intro"
        data-testid="homepage-hero"
        aria-labelledby="homepage-title"
        className="site-hero"
      >
        <div className="min-w-0">
          <SiteEyebrow>
            <span className="site-dot" />
            Terry.TY Chen
          </SiteEyebrow>
          <h1 id="homepage-title">
            嗨，我是 Terry<span className="text-accent">。</span>
          </h1>
          <p className="site-lead">
            這裡放我做過的產品、幾段經歷，以及最近整理的 AI 日報。你可以從下面開始認識我。
          </p>
          <div className="site-actions">
            <Link href="/about" className="site-button site-button-primary">
              關於我
            </Link>
            <Link href={SITE_EMAIL} className="site-button">
              寫信給我 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <SitePortrait priority />
      </section>
      <section data-home-section="experiences" aria-labelledby="experience-title">
        <SiteSectionHeading label="經歷紀錄" title="從這裡開始認識我" id="experience-title">
          <Link href="/story" className="site-text-link">
            看幾段經歷
          </Link>
        </SiteSectionHeading>
        <div data-testid="experience-entries" className="site-card-grid">
          {EXPERIENCE_NOTES.map((note) => (
            <article key={note.id} className="site-card site-note">
              <p className="site-kicker">經歷紀錄</p>
              <h3>
                <Link href={`/story#${note.id}`}>{note.title}</Link>
              </h3>
              <p className="site-card-summary">{note.summary}</p>
              <Link href={`/story#${note.id}`} className="site-text-link">
                讀這段經歷
              </Link>
            </article>
          ))}
        </div>
      </section>
      {updates.length > 0 && (
        <section data-home-section="updates" aria-labelledby="updates-title">
          <SiteSectionHeading label="文章" title="最近更新" id="updates-title">
            <Link href="/posts" className="site-text-link">
              看全部文章
            </Link>
          </SiteSectionHeading>
          <div data-testid="home-updates" className="site-card site-writing">
            {updates.map((post) => (
              <WritingPostCard key={post.slug} post={post} />
            ))}
          </div>
          <Link href="/posts/ai-daily" className="site-text-link mt-3.5">
            AI 日報系列
          </Link>
        </section>
      )}
      <section data-home-section="work" aria-labelledby="work-title">
        <SiteSectionHeading label="作品" title="做過的作品" id="work-title">
          <Link href="/work" className="site-text-link">
            看精選作品
          </Link>
        </SiteSectionHeading>
        <div className="site-card-grid">
          {WORK_CASES.map((work) => (
            <article key={work.slug} className="site-card site-work-card">
              <p className="site-kicker">{WORK_CATEGORY_LABELS[work.category]}</p>
              <h3>
                <Link href={`/work/${work.slug}`}>{work.title}</Link>
              </h3>
              <p className="site-card-summary">{work.summary}</p>
              <Link href={`/work/${work.slug}`} className="site-text-link">
                看作品
              </Link>
            </article>
          ))}
        </div>
      </section>
      <SiteContact home />
    </div>
  )
}
