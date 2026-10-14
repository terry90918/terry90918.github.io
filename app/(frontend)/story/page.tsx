import Link from 'next/link'
import { STORY_CHAPTERS, CV_URL } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'

export const metadata = pageMetadata(
  '我的故事',
  '從書店走進開發，經歷 GJ、VoiceTube、昕力資訊、Nidin，以及法律與旅遊 AI 工作。',
  '/story'
)

export default function StoryPage() {
  return (
    <div className="pb-10 md:pb-14">
      <header className="py-10 md:pt-16 md:pb-11">
        <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">我的故事</h1>
        <p className="mt-5 max-w-prose leading-[1.85] opacity-80 md:text-lg">
          從做出一個產品，到平台、團隊與近期的 AI 工作，這裡選了幾段經歷。完整職涯可在{' '}
          <Link href={CV_URL} prefetch={false} className="text-accent underline underline-offset-4">
            CV
          </Link>{' '}
          查看。
        </p>
      </header>
      {STORY_CHAPTERS.map((note) => (
        <section
          key={note.id}
          id={note.id}
          data-story-note
          aria-labelledby={`${note.id}-title`}
          className="border-border grid w-full max-w-none gap-5 border-t px-0 py-10 md:grid-cols-[1fr_2fr] md:gap-14 md:py-14"
        >
          <div>
            <p className="text-accent text-xs font-medium">經歷紀錄</p>
            <h2
              id={`${note.id}-title`}
              className="mt-2 text-2xl leading-snug font-bold tracking-tight"
            >
              {note.title}
            </h2>
          </div>
          <div className="min-w-0 space-y-4">
            {note.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-prose leading-[1.9] opacity-85 md:text-lg">
                {paragraph}
              </p>
            ))}
            {note.workHref && (
              <Link
                href={note.workHref}
                className="text-accent inline-block rounded-sm text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                看相關作品
              </Link>
            )}
          </div>
        </section>
      ))}
      <SiteContact />
    </div>
  )
}
