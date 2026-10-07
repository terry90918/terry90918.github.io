import CvLayout from '@/components/cv/cv-layout'
import { pageMetadata } from '@/lib/cv/metadata'

export const metadata = pageMetadata('zh-TW')

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CvLayout locale="zh-TW">{children}</CvLayout>
}
