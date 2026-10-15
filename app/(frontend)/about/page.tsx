import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SitePageIntro, SitePortrait, SiteSectionHeading } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '關於我',
  '認識 Terry Chen，以及這個網站的經歷紀錄、作品、翻譯與 AI 日報。',
  '/about'
)
const contacts = [
  ['GitHub', 'https://github.com/terry90918', 'terry90918'],
  ['X', 'https://x.com/zxtw17985321', 'zxtw17985321'],
  ['LinkedIn', 'https://www.linkedin.com/in/tien-yi-chen-98812812a', 'tien-yi-chen-98812812a'],
  ['Email', SITE_EMAIL, 'zxtw17985321@gmail.com'],
]

export default function AboutPage() {
  return (
    <div className="site-page">
      <SitePageIntro label="關於我" title="關於我" />
      <div data-testid="about-profile" className="site-about-profile border-border border-b">
        <SitePortrait />
        <div className="site-about-copy">
          <p>嗨，我是 Terry。這個網站放我做過的產品、幾段經歷與持續整理的 AI 資訊。</p>
          <p>
            你可以從
            <Link href="/story" className="site-text-link">
              幾段經歷
            </Link>
            認識我，到
            <Link href="/work" className="site-text-link">
              作品頁
            </Link>
            看具體工作，或在
            <Link href="/posts" className="site-text-link">
              文章索引
            </Link>
            找到翻譯與 AI 日報。
          </p>
          <p>
            完整雙語履歷在{' '}
            <Link href={CV_URL} prefetch={false} className="site-text-link">
              CV
            </Link>
            ，聯絡我可以直接
            <Link href={SITE_EMAIL} className="site-text-link">
              寫信
            </Link>
            。
          </p>
        </div>
      </div>
      <section data-testid="about-connect" aria-labelledby="connect-title" className="w-full">
        <SiteSectionHeading label="聯絡" title="在這些地方找到我" id="connect-title" />
        <div className="site-contact-links">
          {contacts.map(([label, href, caption]) => (
            <Link key={label} href={href} className="site-card site-contact-link">
              <strong>
                {label} <span aria-hidden="true">↗</span>
              </strong>
              <span className="text-muted-foreground text-xs">{caption}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
