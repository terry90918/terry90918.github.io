'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isLocale, profiles } from '@/lib/cv/profile'
export default function NotFound() {
  const segment = usePathname().split('/')[2]
  const locale = isLocale(segment) ? segment : 'zh-TW'
  const labels = profiles[locale].labels
  return (
    <section className="px-6 py-32 text-center">
      <p className="text-accent-ink text-7xl font-bold">404</p>
      <h1 className="mt-6 text-3xl font-semibold">{labels.notFound}</h1>
      <p className="text-muted-foreground mt-4">{labels.notFoundDescription}</p>
      <Link
        href={`/cv/${locale}`}
        className="hover:text-accent-ink mt-8 inline-block rounded-full border px-6 py-3"
      >
        {labels.backHome}
      </Link>
    </section>
  )
}
