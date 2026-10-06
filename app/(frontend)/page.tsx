import Image from 'next/image'
import Link from 'next/link'
import { getPosts } from '@/lib/posts/queries'
import { EXPERIENCE_NOTES, SITE_EMAIL, WORK_CASES } from '@/lib/site/content'
import { getRecentUpdates } from '@/lib/site/writing'
import { pageMetadata } from '@/lib/site/metadata'
import { WritingPostCard } from '@/components/WritingPostCard'
import { SiteContact } from '@/components/SiteContact'

export const metadata = pageMetadata(
  'Terry Chen',
  '認識 Terry：幾段產品與工程經歷、精選作品，以及最近整理的 AI 資訊。',
  '/'
)

export default async function HomePage() {
  const updates = getRecentUpdates(await getPosts())
  return (
    <div data-testid="homepage-inner" className="w-full space-y-12">
      <section
        data-home-section="intro"
        data-testid="homepage-hero"
        aria-labelledby="homepage-title"
        className="flex flex-col items-start gap-6 px-0 sm:flex-row sm:items-center sm:gap-8"
      >
        <Link
          href="/about"
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="https://github.com/terry90918.png"
            alt="Terry Chen 的照片"
            width={160}
            height={160}
            className="h-28 w-28 rounded-full sm:h-40 sm:w-40"
            priority
            unoptimized
          />
        </Link>
        <div className="min-w-0">
          <h1 id="homepage-title" className="text-3xl leading-tight font-bold">
            嗨，我是 Terry。
          </h1>
          <p className="mt-4 max-w-prose leading-7 opacity-80">
            這裡放我做過的產品、幾段經歷，以及最近整理的 AI 資訊。你可以從下面開始認識我。
          </p>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <Link
              href="/about"
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              關於我
            </Link>
            <Link
              href={SITE_EMAIL}
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              寫信給我
            </Link>
          </div>
        </div>
      </section>

      <section data-home-section="experiences" aria-labelledby="experience-title" className="px-0">
        <h2 id="experience-title" className="text-xl font-bold">
          從這裡開始認識我
        </h2>
        <div data-testid="experience-entries" className="mt-5 space-y-5">
          {EXPERIENCE_NOTES.map((note) => (
            <article key={note.id} className="border-border border-l-2 pl-4">
              <p className="text-xs opacity-60">經歷紀錄</p>
              <h3 className="mt-1 text-lg leading-7 font-bold">
                <Link
                  href={`/story#${note.id}`}
                  className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {note.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm leading-6 opacity-80">{note.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {updates.length > 0 && (
        <section data-home-section="updates" aria-labelledby="updates-title" className="px-0">
          <h2 id="updates-title" className="text-xl font-bold">
            最近更新
          </h2>
          <div data-testid="home-updates" className="mt-2">
            {updates.map((post) => (
              <WritingPostCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <Link
              href="/posts"
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              看全部文章
            </Link>
            <Link
              href="/posts/ai-daily"
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              AI 日報系列
            </Link>
          </div>
        </section>
      )}

      <section data-home-section="work" aria-labelledby="work-title" className="px-0">
        <h2 id="work-title" className="text-xl font-bold">
          做過的作品
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {WORK_CASES.map((work) => (
            <article key={work.slug}>
              <h3 className="font-bold">
                <Link
                  href={`/work/${work.slug}`}
                  className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {work.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-6 opacity-80">{work.summary}</p>
            </article>
          ))}
        </div>
        <Link
          href="/work"
          className="text-accent mt-5 inline-block rounded-sm text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          看精選作品
        </Link>
      </section>
      <section data-home-section="contact" aria-label="聯絡 Terry" className="px-0">
        <SiteContact />
      </section>
    </div>
  )
}
