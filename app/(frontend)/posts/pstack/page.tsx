import WritingSeriesPage from '@/components/WritingSeriesPage'
import { pageMetadata } from '@/lib/site/metadata'
import { WRITING_SERIES } from '@/lib/site/writing-series'

export const metadata = pageMetadata(
  WRITING_SERIES.pstack.title,
  WRITING_SERIES.pstack.description,
  '/posts/pstack'
)

export default async function Page() {
  return WritingSeriesPage({ series: 'pstack' })
}
