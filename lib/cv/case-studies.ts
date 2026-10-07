import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { isLocale, projectSlugs } from './profile'
import type { Locale } from './profile'
export type CaseStudyMetadata = {
  slug: string
  title: string
  description: string
  organisation: string
  role: string
  duration: string
  tools: string[]
  brand: string
  metric: string
  metricLabel: string
  order: number
}
export type CaseStudy = {
  metadata: CaseStudyMetadata
  content: string
}
export async function getCaseStudyBySlug(locale: Locale, slug: string): Promise<CaseStudy | null> {
  if (!isLocale(locale) || !projectSlugs.some((project) => project === slug)) return null
  const file = path.join(process.cwd(), 'content/cv/case-studies', locale, `${slug}.mdx`)
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  return { metadata: { ...data, slug } as CaseStudyMetadata, content }
}
export async function getCaseStudies(locale: Locale, limit?: number): Promise<CaseStudyMetadata[]> {
  if (!isLocale(locale)) return []
  const cases = await Promise.all(projectSlugs.map((slug) => getCaseStudyBySlug(locale, slug)))
  const metadata = cases.map((item) => item!.metadata)
  return limit === undefined ? metadata : metadata.slice(0, limit)
}
