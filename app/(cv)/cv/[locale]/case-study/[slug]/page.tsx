import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReadingProgressPill from '@/components/cv/case-study/reading-progress-pill'
import MDXContent from '@/components/cv/mdx-content'
import FeaturedWorks from '@/components/cv/shared/featured-works/featured-works'
import { getCaseStudyBySlug, getCaseStudies } from '@/lib/cv/case-studies'
import { extractHeadings } from '@/lib/cv/extract-headings'
import { isLocale, projectSlugs, profiles } from '@/lib/cv/profile'
import { pageMetadata } from '@/lib/cv/metadata'
export const dynamicParams = false
export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string
    slug: string
  }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const study = await getCaseStudyBySlug(locale, slug)
  if (!study) notFound()
  return pageMetadata(
    locale,
    `/case-study/${slug}`,
    study.metadata.title,
    study.metadata.description
  )
}
export default async function CaseStudy({
  params,
}: {
  params: Promise<{
    locale: string
    slug: string
  }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const study = await getCaseStudyBySlug(locale, slug)
  if (!study) notFound()
  const labels = profiles[locale].labels
  const { metadata, content } = study
  const others = (await getCaseStudies(locale)).filter((item) => item.slug !== slug).slice(0, 2)
  return (
    <>
      <ReadingProgressPill
        headings={extractHeadings(content)}
        contentId="case-study-content"
        idleLabel={labels.contents}
      />
      <section
        id="case-study-top"
        className="border-b px-4 pt-24 pb-12 sm:px-6 sm:py-24 lg:px-10.5"
      >
        <Link
          href={`/cv/${locale}/#featured-works`}
          className="text-muted-foreground hover:text-accent-ink mb-12 inline-block text-sm"
        >
          ← {labels.backHome}
        </Link>
        <p className="text-accent-ink mb-4 text-sm font-medium">{metadata.brand}</p>
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
          {metadata.title}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{metadata.description}</p>
        <div className="bg-card mt-12 grid gap-8 rounded-3xl border p-6 sm:grid-cols-[1fr_1fr] sm:p-8">
          <div>
            <p className="text-accent-ink text-5xl font-bold tracking-tight sm:text-6xl">
              {metadata.metric}
            </p>
            <p className="text-muted-foreground mt-3 text-sm">{metadata.metricLabel}</p>
          </div>
          <dl className="space-y-4 text-sm">
            {[
              [labels.organisation, metadata.organisation],
              [labels.responsibility, metadata.role],
              [labels.period, metadata.duration],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground mb-1">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" aria-label={labels.tools}>
          {metadata.tools.map((tool) => (
            <span key={tool} className="rounded-full border px-3 py-1 text-xs">
              {tool}
            </span>
          ))}
        </div>
        <div id="case-study-content" className="mt-16">
          <MDXContent source={content} />
        </div>
      </section>
      <FeaturedWorks
        locale={locale}
        caseStudies={others}
        id="other-works"
        eyebrow={labels.otherWork}
        title={labels.otherWorkTitle}
        layout="vertical"
        showBorder={false}
      />
    </>
  )
}
