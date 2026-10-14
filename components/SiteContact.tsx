import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'

export function SiteContact() {
  return (
    <div className="bg-secondary border-border rounded-(--radius) border p-6 md:p-10">
      <p className="max-w-prose leading-8">
        如果你正在做產品、規劃系統或建立工程團隊，歡迎聊聊合作，也歡迎合適的工程與技術管理機會。
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href={SITE_EMAIL}
          className="bg-foreground text-background border-foreground inline-flex min-h-11 items-center justify-center rounded-(--radius) border px-4 py-2.5 font-medium hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          寫信給我
        </Link>
        <Link
          href={CV_URL}
          prefetch={false}
          className="text-accent bg-card border-border hover:bg-accent-surface inline-flex min-h-11 items-center justify-center rounded-(--radius) border px-4 py-2.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          完整 CV
        </Link>
      </div>
    </div>
  )
}
