import Image from 'next/image'
import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'

export const metadata = pageMetadata(
  '關於我',
  '認識 Terry Chen，以及這個網站的經歷紀錄、作品、翻譯與 AI 日報。',
  '/about'
)
const contacts = [
  ['GitHub', 'https://github.com/terry90918'],
  ['X', 'https://x.com/zxtw17985321'],
  ['LinkedIn', 'https://www.linkedin.com/in/tien-yi-chen-98812812a'],
  ['Email', SITE_EMAIL],
]

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">關於我</h1>
      <div
        data-testid="about-profile"
        className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8"
      >
        <Image
          src="https://github.com/terry90918.png"
          alt="Terry Chen 的照片"
          width={160}
          height={160}
          className="h-28 w-28 shrink-0 rounded-full sm:h-40 sm:w-40"
          unoptimized
        />
        <div className="max-w-prose space-y-4 leading-8">
          <p>嗨，我是 Terry。這個網站放我做過的產品、幾段經歷與持續整理的 AI 資訊。</p>
          <p>
            你可以從
            <Link href="/story" className="text-accent underline underline-offset-4">
              幾段經歷
            </Link>
            認識我，到
            <Link href="/work" className="text-accent underline underline-offset-4">
              作品頁
            </Link>
            看具體工作，或在
            <Link href="/posts" className="text-accent underline underline-offset-4">
              文章索引
            </Link>
            找到翻譯與 AI 日報。
          </p>
          <p>
            完整雙語履歷在{' '}
            <Link href={CV_URL} className="text-accent underline underline-offset-4">
              CV
            </Link>
            ，聯絡我可以直接寫信。
          </p>
        </div>
      </div>
      <section
        data-testid="about-connect"
        aria-labelledby="connect-title"
        className="border-border border-t px-0 pt-7"
      >
        <h2 id="connect-title" className="text-xl font-bold">
          在這些地方找到我
        </h2>
        <div className="mt-4 flex flex-wrap gap-6">
          {contacts.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
