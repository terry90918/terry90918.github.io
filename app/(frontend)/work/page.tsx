import Link from 'next/link'
import { WORK_CASES, WORK_CATEGORY_LABELS, SUPPORTING_WORK } from '@/lib/site/content'
import type { WorkCase } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'

export const metadata = pageMetadata(
  '作品',
  '精選產品、平台與 AI 工作流程：GJ、Nidin 你訂、JurisLM，以及合作經驗。',
  '/work'
)
const categories: WorkCase['category'][] = ['product', 'platform', 'ai']

export default function WorkPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold">作品</h1>
        <p className="mt-4 max-w-prose leading-7 opacity-80">
          幾項做過的產品與合作，按工作內容放在這裡。每個案例說明我負責的部分與實際交付。
        </p>
      </header>
      {categories.map((category) => (
        <section
          key={category}
          aria-labelledby={`category-${category}`}
          className="border-border border-t px-0 pt-7"
        >
          <h2 id={`category-${category}`} className="text-xl font-bold">
            {WORK_CATEGORY_LABELS[category]}
          </h2>
          {WORK_CASES.filter((work) => work.category === category).map((work) => (
            <article key={work.slug} className="mt-4">
              <h3 className="text-lg font-bold">
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
            </article>
          ))}
          {SUPPORTING_WORK.filter((work) => work.category === category).map((work) => (
            <article key={work.title} className="border-border mt-5 border-l-2 pl-4">
              <h3 className="font-bold">{work.title}</h3>
              <p className="mt-1 text-sm leading-6 opacity-80">{work.summary}</p>
            </article>
          ))}
        </section>
      ))}
      <SiteContact />
    </div>
  )
}
