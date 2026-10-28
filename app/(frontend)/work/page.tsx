import Link from 'next/link'
import { WorkGallery, CodexActivity } from '@/components/CodexShowcase'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'
import { SitePageIntro } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '作品',
  'Terry 的五項互動作品：Block Out!、BLUEWAKE、DefectHunter AI、ASCII Sharks 與 Ochre Chess，以及 Codex Token 活動紀錄。',
  '/work'
)

export default function WorkPage() {
  return (
    <div className="site-page">
      <SitePageIntro label="作品" title="作品">
        <p className="site-lead">
          一些可以直接操作的遊戲、互動視覺與 AI 原型。每項作品附上功能介紹與體驗連結。
        </p>
      </SitePageIntro>
      <section aria-labelledby="selected-work-title">
        <h2 id="selected-work-title" className="mb-6 text-base font-medium">
          精選作品
        </h2>
        <WorkGallery />
      </section>
      <CodexActivity />
      <p className="text-muted-foreground text-sm">
        產品與工程的職涯案例可在{' '}
        <Link href="/cv" className="site-text-link" prefetch={false}>
          完整 CV
        </Link>{' '}
        閱讀。
      </p>
      <SiteContact />
    </div>
  )
}
