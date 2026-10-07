import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import DesktopIdCard from '@/components/cv/ui/desktop-id-card'
import { contact } from '@/lib/cv/profile'
import type { Locale, Profile } from '@/lib/cv/profile'
export default function Hero({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <section id="top" className="lg:relative">
      <div className="border-b pt-24 pb-12 sm:py-16 lg:pt-32 lg:pb-24">
        <div className="px-4 sm:px-6 lg:px-10.5">
          <div className="space-y-6 lg:max-w-lg">
            <span className="bg-card inline-flex h-5 w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs shadow-sm">
              <span className="bg-accent size-1.5 rounded-full" />
              {profile.location}
            </span>
            <h1 className="text-4xl leading-[1.15] font-semibold tracking-tight sm:text-5xl lg:text-[64px] lg:font-bold">
              <span className="text-muted-foreground mb-2 block text-xl font-medium tracking-normal sm:text-2xl">
                {profile.greeting}
              </span>
              {profile.name}
              <span className="text-accent-ink">.</span>
            </h1>
            <p className="text-muted-foreground text-xl font-medium sm:text-2xl lg:text-3xl">
              {profile.role}
            </p>
            <p className="max-w-lg text-base leading-relaxed lg:max-w-105">{profile.description}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/cv/${locale}/#experience`}
                className="bg-background hover:text-accent-ink rounded-full border px-5 py-3 text-sm"
              >
                {profile.labels.viewExperience}
              </Link>
              <Link
                href={`/cv/${locale}/#contact`}
                className="bg-card hover:text-accent-ink flex items-center gap-3 rounded-full border px-5 py-3 text-sm shadow-sm"
              >
                <span className="bg-accent size-2 rounded-full" />
                {profile.labels.contact}
                <ArrowRight className="size-4" />
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
