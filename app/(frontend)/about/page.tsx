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
    <div className="pb-10 md:pb-14">
      <h1 className="border-border border-b py-10 text-4xl leading-tight font-bold tracking-tight md:py-16 md:text-5xl">
        嗨，我是 Terry。
      </h1>
      <div
        data-testid="about-profile"
        className="grid items-center gap-7 py-10 md:grid-cols-[260px_minmax(0,1fr)] md:gap-16 md:py-16"
      >
        <Image
          src="/images/profile/avatar.webp"
          alt="Terry Chen 的照片"
          width={236}
          height={236}
          className="h-35 w-35 rounded-2xl object-contain md:h-59 md:w-59 md:rounded-3xl"
          unoptimized
        />
        <div className="max-w-prose min-w-0 space-y-4 leading-[1.9] md:text-lg">
          <p>
            我做軟體產品、規劃系統架構，也帶工程團隊。從工作媒合、線上學習到點餐平台，近年也參與法律與旅遊的
            AI 工作。
          </p>
          <p>
            設計與藝術，是最早吸引我走進開發的原因。後來，我的工作從前端延伸到後端、系統與團隊，經歷過新產品上線，也參與長期平台與大型專案的推進。
          </p>
          <p>我也整理 AI 相關資訊與翻譯。這裡收錄我的故事、作品，以及持續更新的文章。</p>
          <p>
            <Link href="/story" className="text-accent underline underline-offset-4">
              讀我的故事
            </Link>
            {' · '}
            <Link href="/work" className="text-accent underline underline-offset-4">
              看精選作品
            </Link>
            {' · '}
            <Link href="/posts" className="text-accent underline underline-offset-4">
              閱讀文章
            </Link>
          </p>
          <p>
            <Link
              href={CV_URL}
              prefetch={false}
              className="text-accent underline underline-offset-4"
            >
              完整 CV
            </Link>
            ，聯絡我可以直接寫信。
          </p>
        </div>
      </div>
      <section
        data-testid="about-connect"
        aria-labelledby="connect-title"
        className="border-border w-full max-w-none border-t px-0 pt-10 md:pt-14"
      >
        <h2 id="connect-title" className="text-2xl font-bold tracking-tight md:text-3xl">
          在這些地方找到我
        </h2>
        <div className="mt-6 grid gap-4 min-[421px]:grid-cols-2 lg:grid-cols-4">
          {contacts.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-accent bg-card border-border hover:bg-accent-surface flex min-h-11 items-center rounded-(--radius) border p-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
