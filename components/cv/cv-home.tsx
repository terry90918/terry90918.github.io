import Link from 'next/link'
import { ArrowUpRight, Plus } from 'lucide-react'
import Hero from '@/components/cv/home/hero/hero'
import Experience from '@/components/cv/home/experience/experience'
import FeaturedWorks from '@/components/cv/shared/featured-works/featured-works'
import { SiteEyebrow as Eyebrow } from '@/components/SitePrimitives'
import type { CaseStudyMetadata } from '@/lib/cv/case-studies'
import { contact } from '@/lib/cv/profile'
import reference from '@/lib/site/design-reference.json'
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
  const copy = reference.cv[locale]
  const labels = { ...profile.labels, ...copy.labels }
  return (
    <div className="cv-home-reference">
      <Hero locale={locale} profile={profile} role={copy.role} />
      <section id="about" className="border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10.5 lg:py-24">
        <Eyebrow>{labels.about}</Eyebrow>
        <h2 className="leading-snug font-bold">{labels.aboutTitle}</h2>
        <div className="cv-stats-grid">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="site-card">
              <p className="text-accent-ink text-[32px] leading-snug font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      <FeaturedWorks
        locale={locale}
        caseStudies={copy.projects.map((copy) => {
          const project = projects.find((project) => project.slug === copy.slug)
          if (!project) throw new Error(`Missing CV project: ${copy.slug}`)
          return { ...project, ...copy }
        })}
        eyebrow={labels.work}
        title={labels.workTitle}
        layout="reference"
      />
      <Experience profile={{ ...profile, labels, experiences: copy.experiences }} />
      <section id="education" className="border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10.5 lg:py-24">
        <Eyebrow>{labels.education}</Eyebrow>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="bg-card rounded-lg border p-5 sm:p-6">
            <h3 className="text-xl font-bold">{profile.education.school}</h3>
            <p className="mt-3">{profile.education.field}</p>
            <p className="text-muted-foreground mt-4 text-sm">{profile.education.period}</p>
          </div>
          <div className="bg-card rounded-lg border p-5 sm:p-6">
            <h3 className="text-xl font-bold">{labels.military}</h3>
            <p className="text-muted-foreground mt-4 text-sm">{profile.military}</p>
          </div>
        </div>
      </section>
      <section id="contact" className="cv-contact-reference">
        <Eyebrow>{labels.contact}</Eyebrow>
        <div className="mt-3 flex flex-col items-start gap-6">
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
            className="site-button site-button-primary"
          >
            {labels.contactDetails}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>
      <section id="skills" className="border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10.5 lg:py-24">
        <Eyebrow>{labels.skills}</Eyebrow>
        <h2 className="leading-snug font-bold">{labels.skillsTitle}</h2>
        <div className="site-card cv-skills-card mt-6 divide-y">
          {copy.skills.map((skill, index) => (
            <details key={skill.title} className="group py-[18px]" open={index === 0}>
              <summary className="flex min-h-[30px] cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                <span>{skill.title}</span>
                <Plus className="text-accent-ink size-5 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <div className="space-y-4 pt-5">
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="bg-card rounded-md border px-3 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
