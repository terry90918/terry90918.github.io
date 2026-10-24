import WritingSeriesPage from '@/components/WritingSeriesPage'
import { pageMetadata } from '@/lib/site/metadata'
import { WRITING_SERIES } from '@/lib/site/writing-series'

export const metadata = pageMetadata(
  WRITING_SERIES.harness2.title,
  WRITING_SERIES.harness2.description,
  '/posts/harness2'
)

export default async function Page() {
  return WritingSeriesPage({ series: 'harness2' })
}
