import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'

export function SiteContact() {
  return (
    <div className="border-border border-t pt-7">
      <p className="max-w-prose leading-7">
        如果你正在做產品、規劃系統或建立工程團隊，歡迎聊聊合作，也歡迎合適的工程與技術管理機會。
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
