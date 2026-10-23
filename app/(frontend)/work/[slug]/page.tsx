import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WORK_CASES, WORK_CATEGORY_LABELS } from '@/lib/site/content'
import { pageMetadata } from '@/lib/site/metadata'
import { SiteContact } from '@/components/SiteContact'

export const dynamicParams = false
export function generateStaticParams() {
  return WORK_CASES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = WORK_CASES.find((work) => work.slug === slug)
  if (!work) notFound()
  return pageMetadata(work.title, work.summary, `/work/${work.slug}`)
}

export default async function WorkCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = WORK_CASES.find((work) => work.slug === slug)
  if (!work) notFound()
  const storyId = slug === 'jurislm' ? 'ai-work' : slug
  return (
    <article className="site-page">
      <header className="site-page-intro">
        <Link href="/work" className="site-text-link mb-5">
          ← 回到精選作品
        </Link>
        <p className="text-accent-ink mt-6 text-sm font-medium">
          {WORK_CATEGORY_LABELS[work.category]}
        </p>
        <h1 className="mt-2 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
          {work.title}
        </h1>
        <p className="site-lead">{work.summary}</p>
      </header>
      <div className="site-case-body">
        <Card asChild className="gap-0 px-6">
          <section aria-labelledby="role-title" className="site-card self-start">
            <h2 id="role-title" className="text-lg font-bold">
              我的角色
            </h2>
            <p className="mt-3 leading-7">{work.role}</p>
            <p className="mt-1 text-sm opacity-65">{work.period}</p>
          </section>
        </Card>
        <section aria-labelledby="delivery-title">
          <h2 id="delivery-title" className="text-lg font-bold">
            做過的工作
          </h2>
          <ul className="site-evidence">
            {work.evidence.map((item) => (
              <li key={item} className="max-w-prose">
                {item}
              </li>
            ))}
          </ul>
          <Link href={`/story#${storyId}`} className="site-text-link">
            讀這段經歷
          </Link>
        </section>
      </div>
      <SiteContact />
    </article>
  )
}
