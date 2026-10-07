import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin, Plus } from 'lucide-react'
import Hero from '@/components/cv/home/hero/hero'
import Experience from '@/components/cv/home/experience/experience'
import FeaturedWorks from '@/components/cv/shared/featured-works/featured-works'
import Eyebrow from '@/components/cv/shared/eyebrow/eyebrow'
import type { CaseStudyMetadata } from '@/lib/cv/case-studies'
import { contact } from '@/lib/cv/profile'
import type { Locale, Profile } from '@/lib/cv/profile'
export default function CvHome({
  locale,
  profile,
  projects,
}: {
  locale: Locale
  profile: Profile
  projects: CaseStudyMetadata[]
}) {
  const labels = profile.labels
  return (
    <>
      <Hero locale={locale} profile={profile} />
      <section id="about" className="border-b px-4 py-12 sm:px-6 sm:py-24 lg:px-10.5">
        <Eyebrow>{labels.about}</Eyebrow>
        <h2 className="mt-2 text-2xl leading-snug font-semibold md:text-3xl lg:text-4xl">
          {labels.aboutTitle}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="bg-card overflow-hidden rounded-3xl border p-2">
            <Image
              src={contact.photo}
              alt={profile.name}
              width={560}
              height={700}
              className="aspect-4/5 w-full rounded-2xl object-cover"
            />
            <div className="px-4 py-5">
              <p className="text-xl font-semibold">{profile.name}</p>
              <p className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                <MapPin className="size-3.5 shrink-0" />
                {profile.location}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="space-y-4 text-base leading-relaxed">
              {profile.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-2 gap-3">
              {profile.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card flex flex-col justify-center rounded-2xl border p-5"
                >
                  <p className="text-accent-ink text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <FeaturedWorks
        locale={locale}
        caseStudies={projects}
        eyebrow={labels.work}
        title={labels.workTitle}
      />
      <Experience profile={profile} />
      <section id="skills" className="border-b px-4 py-12 sm:px-6 sm:py-24 lg:px-10.5">
        <Eyebrow>{labels.skills}</Eyebrow>
        <h2 className="mt-2 text-2xl leading-snug font-semibold md:text-3xl lg:text-4xl">
          {labels.skillsTitle}
        </h2>
        <div className="mt-10 divide-y">
          {profile.skills.map((skill, index) => (
            <details key={skill.title} className="group py-5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium sm:text-2xl">
                <span>
                  <span className="text-muted-foreground mr-3 text-sm">0{index + 1}.</span>
                  {skill.title}
                </span>
                <Plus className="text-accent-ink size-5 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <div className="space-y-4 pt-5 sm:pl-9">
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="bg-card rounded-full border px-3 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                  {skill.description}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <section id="education" className="border-b px-4 py-12 sm:px-6 sm:py-24 lg:px-10.5">
        <Eyebrow>{labels.education}</Eyebrow>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="bg-card rounded-3xl border p-6">
            <h2 className="text-2xl font-semibold">{profile.education.school}</h2>
            <p className="mt-3">{profile.education.field}</p>
            <p className="text-muted-foreground mt-4 text-sm">{profile.education.period}</p>
          </div>
          <div className="rounded-3xl border p-6">
            <h2 className="text-xl font-medium">{labels.military}</h2>
            <p className="text-muted-foreground mt-4 text-sm">{profile.military}</p>
          </div>
        </div>
      </section>
      <section
        id="contact"
        className="min-h-[calc(100svh-6rem)] px-4 py-12 sm:px-6 sm:py-24 lg:px-10.5"
      >
        <Eyebrow>{labels.contact}</Eyebrow>
        <div className="mt-3 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <h2 className="max-w-lg text-2xl leading-snug font-semibold md:text-3xl">
              {labels.contactTitle}
            </h2>
            <a
              href={`mailto:${contact.email}`}
              className="text-muted-foreground hover:text-accent-ink mt-6 inline-block break-all"
            >
              {contact.email}
            </a>
          </div>
          <Link
            href={`/cv/${locale}/contact#contact-top`}
            className="bg-card hover:text-accent-ink flex shrink-0 items-center gap-3 rounded-full border px-5 py-3 text-sm shadow-sm"
          >
            {labels.contactDetails}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
