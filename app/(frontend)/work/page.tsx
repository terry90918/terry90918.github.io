import Link from 'next/link'
import { WORK_CASES, WORK_CATEGORY_LABELS, SUPPORTING_WORK } from '@/lib/site/content'
import type { WorkCase } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'
import { SitePageIntro } from '@/components/SitePrimitives'

export const metadata = pageMetadata(
  '作品',
  'Nidin 你訂、昕力資訊、GJ、VoiceTube、JurisLM 與 Channel-T：產品、系統與工程團隊的工作。',
  '/work'
)
const categories: WorkCase['category'][] = ['platform', 'product', 'ai']

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
                {work.slug === 'nidin' && (
                  <p className="site-card-summary">
                    擔任雲仲資訊技術經理，直接管理 10 位工程師。促銷優惠券採分批發送與 API
                    控流，避免影響訂單服務。
                  </p>
                )}
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
                <h3 className="font-bold">{work.title}</h3>
                <p className="mt-1 text-sm leading-6 opacity-80">{work.summary}</p>
                {work.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-sm leading-6 opacity-80">
                    {paragraph}
                  </p>
                ))}
                {work.responsibilities && (
                  <>
                    <p className="mt-3 text-sm leading-6 opacity-80">我主要負責：</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 opacity-80">
                      {work.responsibilities.map((responsibility) => (
                        <li key={responsibility}>{responsibility}</li>
                      ))}
                    </ul>
                  </>
                )}
                {work.afterword && (
                  <p className="mt-3 text-sm leading-6 opacity-80">{work.afterword}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
      <SiteContact />
    </div>
  )
}
