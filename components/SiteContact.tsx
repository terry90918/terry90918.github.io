import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'
import { SiteEyebrow } from '@/components/SitePrimitives'

export function SiteContact({ home = false }: { home?: boolean }) {
  return (
    <section
      data-home-section={home ? 'contact' : undefined}
      aria-label="聯絡 Terry"
      className="site-contact-panel"
    >
      <SiteEyebrow>聯絡</SiteEyebrow>
      <h2>聯絡 Terry</h2>
      <p className="site-contact-copy">
        如果你正在做產品、規劃系統或建立工程團隊，歡迎聊聊合作，也歡迎合適的工程與技術管理機會。
      </p>
      <div className="site-actions">
        <Link href={SITE_EMAIL} className="site-button site-button-primary">
          寫信給我 <span aria-hidden="true">↗</span>
        </Link>
        <Link href={CV_URL} prefetch={false} className="site-button">
          完整 CV
        </Link>
      </div>
    </section>
  )
}
