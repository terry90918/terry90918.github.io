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
    <article className="space-y-8">
      <header>
        <Link href="/work" className="text-accent text-sm underline underline-offset-4">
          回到精選作品
        </Link>
        <p className="mt-6 text-sm opacity-65">{WORK_CATEGORY_LABELS[work.category]}</p>
        <h1 className="mt-2 text-3xl font-bold">{work.title}</h1>
        <p className="mt-4 max-w-prose leading-8">{work.summary}</p>
      </header>
      <section aria-labelledby="role-title" className="px-0">
        <h2 id="role-title" className="text-lg font-bold">
          我的角色
        </h2>
        <p className="mt-3 leading-7">{work.role}</p>
        <p className="mt-1 text-sm opacity-65">{work.period}</p>
      </section>
      <section aria-labelledby="delivery-title" className="px-0">
        <h2 id="delivery-title" className="text-lg font-bold">
          做過的工作
        </h2>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          {work.evidence.map((item) => (
            <li key={item} className="max-w-prose leading-8">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <Link
        href={`/story#${storyId}`}
        className="text-accent inline-block text-sm underline underline-offset-4"
      >
        讀這段經歷
      </Link>
      <SiteContact />
    </article>
  )
}
