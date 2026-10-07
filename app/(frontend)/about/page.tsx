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
      <h1 className="text-3xl font-bold">嗨，我是 Terry。</h1>
      <div
        data-testid="about-profile"
        className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8"
      >
        <Image
          src="/images/profile/avatar.webp"
          alt="Terry Chen 的照片"
          width={160}
          height={160}
          className="h-28 w-28 shrink-0 rounded-full sm:h-40 sm:w-40"
          unoptimized
        />
        <div className="max-w-prose space-y-4 leading-8">
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
