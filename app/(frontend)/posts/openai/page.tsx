import WritingSeriesPage from '@/components/WritingSeriesPage'
import { pageMetadata } from '@/lib/site/metadata'
import { WRITING_SERIES } from '@/lib/site/writing-series'

export const metadata = pageMetadata(
  WRITING_SERIES.openai.title,
  WRITING_SERIES.openai.description,
  '/posts/openai'
)

export default async function Page() {
  return WritingSeriesPage({ series: 'openai' })
}
