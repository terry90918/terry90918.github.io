import Link from 'next/link'
import { STORY_CHAPTERS, CV_URL } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'
import { SitePageIntro } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '我的故事',
  '從 GJ 共同創辦、Nidin 的系統與團隊工作，到近期法律與旅遊 AI 合作的幾段經歷。',
  '/story'
)

export default function StoryPage() {
  return (
    <div className="site-page">
      <SitePageIntro label="故事" title="幾段經歷">
        <p className="site-lead">
          從做出一個產品，到平台、團隊與近期的 AI 工作，這裡選了幾段經歷。完整職涯可在{' '}
          <Link href={CV_URL} prefetch={false} className="text-accent underline underline-offset-4">
            CV
          </Link>{' '}
          查看。
        </p>
      </SitePageIntro>
      {STORY_CHAPTERS.map((note, index) => (
        <section
          key={note.id}
          id={note.id}
          data-story-note
          aria-labelledby={`${note.id}-title`}
          className="site-split"
        >
          <div>
            <p className="site-split-index">{String(index + 1).padStart(2, '0')}</p>
            <p className="site-kicker mb-1.5">經歷紀錄</p>
            <h2 id={`${note.id}-title`} className="font-bold">
              {note.title}
            </h2>
          </div>
          <div className="site-story-copy">
            {note.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-prose">
                {paragraph}
              </p>
            ))}
            {note.workHref && (
              <Link href={note.workHref} className="site-text-link">
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
