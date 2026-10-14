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
    <div data-testid="homepage-inner" className="w-full">
      <section
        data-home-section="intro"
        data-testid="homepage-hero"
        aria-labelledby="homepage-title"
        className="border-border grid w-full max-w-none items-center gap-9 border-b px-0 py-10 md:min-h-117.5 md:grid-cols-[1.4fr_1fr] md:gap-16 md:py-16"
      >
        <Link
          href="/about"
          className="order-1 justify-self-start rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 md:order-2 md:justify-self-center"
        >
          <Image
            src="/images/profile/avatar.webp"
            alt="Terry Chen 的照片"
            width={252}
            height={252}
            className="h-25 w-25 rounded-2xl object-contain md:h-63 md:w-63 md:rounded-3xl"
            priority
            unoptimized
          />
        </Link>
        <div className="order-2 min-w-0 md:order-1">
          <h1
            id="homepage-title"
            className="text-[2.375rem] leading-[1.16] font-bold tracking-tight md:text-[3.5rem]"
          >
            嗨，我是 Terry。
          </h1>
          <p className="mt-5 max-w-prose leading-[1.85] opacity-80 md:text-lg">
            這裡放我做過的產品、幾段經歷，以及最近整理的 AI 資訊。你可以從下面開始認識我。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href="/about"
              className="bg-foreground text-background border-foreground inline-flex min-h-11 items-center justify-center rounded-(--radius) border px-4 py-2.5 font-medium hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              關於我
            </Link>
            <Link
              href={SITE_EMAIL}
              className="text-accent bg-card border-border hover:bg-accent-surface inline-flex min-h-11 items-center justify-center rounded-(--radius) border px-4 py-2.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              寫信給我
            </Link>
          </div>
        </div>
      </section>

      <section
        data-home-section="experiences"
        aria-labelledby="experience-title"
        className="border-border w-full max-w-none border-b px-0 py-10 md:py-14"
      >
        <h2
          id="experience-title"
          className="text-2xl leading-snug font-bold tracking-tight md:text-3xl"
        >
          從這裡開始認識我
        </h2>
        <div data-testid="experience-entries" className="mt-6 grid gap-4 lg:grid-cols-3">
          {EXPERIENCE_NOTES.map((note) => (
            <article
              key={note.id}
              className="bg-card border-border first:border-t-brand rounded-(--radius) border p-5 first:border-t-3 md:p-6"
            >
              <p className="text-accent text-xs font-medium">經歷紀錄</p>
              <h3 className="mt-2 text-xl leading-8 font-bold">
                <Link
                  href={`/story#${note.id}`}
                  className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {note.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-7 opacity-80">{note.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {updates.length > 0 && (
        <section
          data-home-section="updates"
          aria-labelledby="updates-title"
          className="border-border w-full max-w-none border-b px-0 py-10 md:py-14"
        >
          <h2
            id="updates-title"
            className="text-2xl leading-snug font-bold tracking-tight md:text-3xl"
          >
            最近更新
          </h2>
          <div
            data-testid="home-updates"
            className="bg-card border-border mt-6 rounded-(--radius) border px-5 md:px-6"
          >
            {updates.map((post) => (
              <WritingPostCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href="/posts"
              className="text-accent rounded-sm underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              看全部文章
            </Link>
            <Link
              href="/posts/ai-daily"
              className="text-accent rounded-sm underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              AI 日報系列
            </Link>
          </div>
        </section>
      )}

      <section
        data-home-section="work"
        aria-labelledby="work-title"
        className="border-border w-full max-w-none border-b px-0 py-10 md:py-14"
      >
        <h2 id="work-title" className="text-2xl leading-snug font-bold tracking-tight md:text-3xl">
          做過的作品
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {WORK_CASES.map((work) => (
            <article
              key={work.slug}
              className="bg-card border-border rounded-(--radius) border p-5 md:p-6"
            >
              <h3 className="text-xl font-bold">
                <Link
                  href={`/work/${work.slug}`}
                  className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {work.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-7 opacity-80">{work.summary}</p>
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
      <section
        data-home-section="contact"
        aria-label="聯絡 Terry"
        className="w-full max-w-none px-0 py-10 md:py-14"
      >
        <SiteContact />
      </section>
    </div>
  )
}
