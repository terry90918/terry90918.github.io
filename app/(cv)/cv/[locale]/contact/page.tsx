import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import FeaturedWorks from '@/components/cv/shared/featured-works/featured-works'
import Eyebrow from '@/components/cv/shared/eyebrow/eyebrow'
import { getCaseStudies } from '@/lib/cv/case-studies'
import { contact, isLocale, profiles } from '@/lib/cv/profile'
import { pageMetadata } from '@/lib/cv/metadata'
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string
  }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return pageMetadata(locale, '/contact', profiles[locale].labels.contact)
}
export default async function Contact({
  params,
}: {
  params: Promise<{
    locale: string
  }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const profile = profiles[locale]
  const labels = profile.labels
  const links = [
    { label: labels.email, value: contact.email, href: `mailto:${contact.email}`, Icon: Mail },
    { label: labels.phone, value: contact.phone, href: contact.phoneHref, Icon: Phone },
    { label: 'GitHub', value: 'terry90918', href: contact.github, Icon: Github },
    { label: 'LinkedIn', value: 'Tien Yi Chen', href: contact.linkedin, Icon: Linkedin },
  ]
  return (
    <>
      <section id="contact-top" className="border-b px-4 pt-24 pb-12 sm:px-6 sm:py-24 lg:px-10.5">
        <Link
          href={`/cv/${locale}#top`}
          className="text-muted-foreground hover:text-accent-ink mb-12 inline-flex text-sm"
        >
          ← {labels.backHome}
        </Link>
        <Eyebrow>{labels.contact}</Eyebrow>
        <h1 className="mt-2 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
          {labels.contactTitle}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{labels.contactDescription}</p>
        <div className="mt-12 grid items-start gap-8 md:grid-cols-[1fr_280px]">
          <div className="grid gap-3">
            {links.map(({ label, value, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('https') ? '_blank' : undefined}
                rel={href.startsWith('https') ? 'noopener noreferrer' : undefined}
                className="bg-card hover:border-accent flex min-w-0 items-center gap-4 rounded-2xl border p-5 transition-colors"
              >
                <Icon className="text-accent-ink size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="mt-1 text-sm break-words sm:text-base">{value}</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0" />
              </a>
            ))}
            <div className="flex items-center gap-3 px-2 py-4 text-sm">
              <MapPin className="text-accent-ink size-4 shrink-0" />
              {profile.location}
            </div>
          </div>
          <div className="bg-card overflow-hidden rounded-3xl border p-2">
            <Image
              src={contact.photo}
              alt={profile.name}
              width={560}
              height={700}
              className="aspect-4/5 w-full rounded-2xl object-cover"
            />
            <div className="p-4">
              <p className="text-xl font-semibold">{profile.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">{profile.role}</p>
            </div>
          </div>
        </div>
      </section>
      <FeaturedWorks
        locale={locale}
        caseStudies={await getCaseStudies(locale, 2)}
        title={labels.otherWorkTitle}
        eyebrow={labels.work}
        layout="vertical"
      />
    </>
  )
}
