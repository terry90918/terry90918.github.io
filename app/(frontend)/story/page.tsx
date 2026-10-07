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
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold">我的故事</h1>
        <p className="mt-4 max-w-prose leading-7 opacity-80">
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
          className="border-border space-y-4 border-t px-0 pt-8"
        >
          <p className="text-xs opacity-60">經歷紀錄</p>
          <h2 id={`${note.id}-title`} className="text-xl leading-8 font-bold">
            {note.title}
          </h2>
          {note.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-prose leading-8 opacity-85">
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
        </section>
      ))}
      <SiteContact />
    </div>
  )
}
