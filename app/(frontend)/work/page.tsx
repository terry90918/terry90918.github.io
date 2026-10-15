import Link from 'next/link'
import { WORK_CASES, WORK_CATEGORY_LABELS, SUPPORTING_WORK } from '@/lib/site/content'
import type { WorkCase } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'
import { SitePageIntro } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '作品',
  'GJ、Nidin 你訂與 JurisLM 的產品、平台與 AI 工作案例，以及 VClass、Channel-T 合作經驗。',
  '/work'
)
const categories: WorkCase['category'][] = ['product', 'platform', 'ai']

export default function WorkPage() {
  return (
    <div className="site-page">
      <SitePageIntro label="作品" title="作品">
        <p className="site-lead">
          幾項做過的產品與合作，按工作內容放在這裡。每個案例說明我負責的部分與實際交付。
        </p>
      </SitePageIntro>
      {categories.map((category, index) => (
        <section key={category} aria-labelledby={`category-${category}`} className="site-split">
          <div>
            <p className="site-split-index">{String(index + 1).padStart(2, '0')}</p>
            <h2
              id={`category-${category}`}
              className="text-2xl leading-snug font-bold tracking-tight"
            >
              {WORK_CATEGORY_LABELS[category]}
            </h2>
          </div>
          <div className="min-w-0 space-y-4">
            {WORK_CASES.filter((work) => work.category === category).map((work) => (
              <article key={work.slug} className="site-card site-work-card">
                <h3 className="text-xl font-bold tracking-tight">
                  <Link href={`/work/${work.slug}`} className="hover:text-accent">
                    {work.title}
                  </Link>
                </h3>
                <p className="site-card-summary">{work.summary}</p>
                <p className="site-work-meta">
                  {work.period} · {work.role}
                </p>
                <Link href={`/work/${work.slug}`} className="site-text-link">
                  看作品
                </Link>
              </article>
            ))}
            {SUPPORTING_WORK.filter((work) => work.category === category).map((work) => (
              <article
                key={work.id}
                id={work.id}
                className="site-card site-supporting scroll-mt-56"
              >
                <p className="site-kicker">合作經驗</p>
                <h3 className="font-bold">{work.title}</h3>
                <p className="mt-1 text-sm leading-6 opacity-80">{work.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
      <SiteContact />
    </div>
  )
}
