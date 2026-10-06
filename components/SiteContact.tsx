import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'

export function SiteContact() {
  return (
    <div className="border-border border-t pt-7">
      <p className="max-w-prose leading-7">
        如果你想聊聊產品開發、系統設計，或把 AI 放進實際工作流程，歡迎來信。
      </p>
      <div className="mt-3 flex flex-wrap gap-5 text-sm">
        <Link
          href={SITE_EMAIL}
          className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          寫信給我
        </Link>
        <Link
          href={CV_URL}
          className="text-accent rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          完整 CV
        </Link>
      </div>
    </div>
  )
}
