import { notFound } from 'next/navigation'
import CvLayout from '@/components/cv/cv-layout'
import { isLocale, locales } from '@/lib/cv/profile'
import { pageMetadata } from '@/lib/cv/metadata'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return pageMetadata(locale)
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <CvLayout locale={locale}>{children}</CvLayout>
}
