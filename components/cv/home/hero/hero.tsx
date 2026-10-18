import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import DesktopIdCard from '@/components/cv/ui/desktop-id-card'
import { contact } from '@/lib/cv/profile'
import type { Locale, Profile } from '@/lib/cv/profile'
export default function Hero({
  locale,
  profile,
  role,
}: {
  locale: Locale
  profile: Profile
  role: string
}) {
  return (
    <section id="top" className="cv-reference-hero lg:relative">
      <div className="cv-reference-hero-inner">
        <div>
          <Image
            src={contact.photo}
            alt={profile.name}
            width={140}
            height={210}
            className="cv-mobile-portrait mb-9 rounded-2xl object-contain min-[1024px]:hidden"
          />
          <div className="cv-reference-hero-copy lg:max-w-lg">
            <span className="bg-card inline-flex h-7 w-fit items-center gap-2 rounded-md border px-3 py-1 text-xs">
              <span className="bg-brand size-1.5 rounded-full" />
              {profile.location}
            </span>
            <p className="cv-reference-greeting text-muted-foreground text-xl font-normal tracking-normal">
              {profile.greeting}
            </p>
            <h1 className="cv-reference-name font-bold">
              {profile.name}
              <span className="text-accent-ink">.</span>
            </h1>
            <p className="cv-reference-role text-muted-foreground">{role}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={`/cv/${locale}/#experience`} className="site-button site-button-primary">
                {profile.labels.viewExperience}{' '}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href={`/cv/${locale}/#contact`} className="site-button">
                {locale === 'en' ? 'Contact' : '聯絡方式'}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <DesktopIdCard
        frontImage={contact.photo}
        className="mx-auto mt-8 aspect-4/5 w-full max-w-80 max-lg:hidden lg:absolute lg:-top-31 lg:right-0 lg:left-0 lg:z-10 lg:mt-0 lg:aspect-auto lg:h-192 lg:max-w-none"
      />
    </section>
  )
}
