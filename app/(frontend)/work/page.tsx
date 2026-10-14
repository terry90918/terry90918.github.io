import Link from 'next/link'
import { WORK_CASES, WORK_CATEGORY_LABELS, SUPPORTING_WORK } from '@/lib/site/content'
import type { WorkCase } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'

export const metadata = pageMetadata(
  '作品',
  'Nidin 你訂、昕力資訊、GJ、VoiceTube、JurisLM 與 Channel-T：產品、系統與工程團隊的工作。',
  '/work'
)
const categories: WorkCase['category'][] = ['platform', 'product', 'ai']

export default function WorkPage() {
  return (
    <div className="pb-10 md:pb-14">
      <header className="py-10 md:pt-16 md:pb-11">
        <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">作品</h1>
        <p className="mt-5 max-w-prose leading-[1.85] opacity-80 md:text-lg">
          幾項做過的產品與合作，按工作內容放在這裡。每個案例說明我負責的部分與實際交付。
        </p>
      </header>
      {categories.map((category) => (
        <section
          key={category}
          aria-labelledby={`category-${category}`}
          className="border-border grid w-full max-w-none gap-5 border-t px-0 py-10 md:grid-cols-[1fr_2fr] md:gap-14 md:py-14"
        >
          <h2
            id={`category-${category}`}
            className="text-2xl leading-snug font-bold tracking-tight"
          >
            {WORK_CATEGORY_LABELS[category]}
          </h2>
          <div className="min-w-0 space-y-4">
            {WORK_CASES.filter((work) => work.category === category).map((work) => (
              <article
                key={work.slug}
                className="bg-card border-border rounded-(--radius) border p-5 md:p-6"
              >
                <h3 className="text-xl font-bold tracking-tight">
                  <Link
                    href={`/work/${work.slug}`}
                    className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {work.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-prose leading-7 opacity-85">{work.summary}</p>
                <p className="mt-2 text-sm leading-6 opacity-65">
                  {work.period} · {work.role}
                </p>
                {work.slug === 'nidin' && (
                  <p className="mt-2 max-w-prose leading-7 opacity-85">
                    擔任雲仲資訊技術經理，直接管理 10 位工程師。促銷優惠券採分批發送與 API
                    控流，避免影響訂單服務。
                  </p>
                )}
              </article>
            ))}
            {SUPPORTING_WORK.filter((work) => work.category === category).map((work) => (
              <article
                key={work.id}
                id={work.id}
                className="bg-secondary border-border scroll-mt-56 rounded-(--radius) border p-5 md:p-6"
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
