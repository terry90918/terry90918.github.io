import { Button } from '@/components/ui/button'
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
        如果你想聊聊產品開發、系統設計，或把 AI 放進實際工作流程，歡迎來信。
      </p>
      <div className="site-actions">
        <Button asChild variant="default">
          <Link href={SITE_EMAIL}>
            寫信給我 <span aria-hidden="true">↗</span>
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={CV_URL} prefetch={false}>
            完整 CV
          </Link>
        </Button>
      </div>
    </section>
  )
}
