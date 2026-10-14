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
    <article className="pb-10 md:pb-14">
      <header className="border-border border-b py-10 md:pt-16 md:pb-11">
        <Link href="/work" className="text-accent text-sm underline underline-offset-4">
          回到精選作品
        </Link>
        <p className="text-accent mt-6 text-sm font-medium">
          {WORK_CATEGORY_LABELS[work.category]}
        </p>
        <h1 className="mt-2 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
          {work.title}
        </h1>
        <p className="mt-5 max-w-prose leading-[1.85] opacity-80 md:text-lg">{work.summary}</p>
      </header>
      <div className="grid gap-7 py-10 md:grid-cols-[1fr_2fr] md:gap-14 md:py-14">
        <section
          aria-labelledby="role-title"
          className="bg-card border-border w-full max-w-none self-start rounded-(--radius) border p-5 md:p-6"
        >
          <h2 id="role-title" className="text-lg font-bold">
            我的角色
          </h2>
          <p className="mt-3 leading-7">{work.role}</p>
          <p className="mt-1 text-sm opacity-65">{work.period}</p>
        </section>
        <section aria-labelledby="delivery-title" className="w-full max-w-none px-0">
          <h2 id="delivery-title" className="text-lg font-bold">
            做過的工作
          </h2>
          <ul className="border-border mt-3 list-disc divide-y divide-(--border) pl-5">
            {work.evidence.map((item) => (
              <li key={item} className="max-w-prose py-4 leading-8">
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={`/story#${storyId}`}
            className="text-accent inline-block text-sm underline underline-offset-4"
          >
            讀這段經歷
          </Link>
        </section>
      </div>
      <SiteContact />
    </article>
  )
}
