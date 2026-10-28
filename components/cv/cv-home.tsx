import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CodexProfile } from '@/components/CodexShowcase'
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
            <Card key={stat.label} asChild className="gap-0 px-6">
              <div className="site-card">
                <p className="text-accent-ink text-[32px] leading-snug font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">{stat.label}</p>
              </div>
            </Card>
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
          <Card asChild className="gap-0 px-6">
            <div className="bg-card rounded-lg border p-5 sm:p-6">
              <h3 className="text-xl font-bold">{profile.education.school}</h3>
              <p className="mt-3">{profile.education.field}</p>
              <p className="text-muted-foreground mt-4 text-sm">{profile.education.period}</p>
            </div>
          </Card>
          <Card asChild className="gap-0 px-6">
            <div className="bg-card rounded-lg border p-5 sm:p-6">
              <h3 className="text-xl font-bold">{labels.military}</h3>
              <p className="text-muted-foreground mt-4 text-sm">{profile.military}</p>
            </div>
          </Card>
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
          <Button asChild variant="default">
            <Link href={`/cv/${locale}/contact#contact-top`}>
              {labels.contactDetails}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <section id="skills" className="border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10.5 lg:py-24">
        <Eyebrow>{labels.skills}</Eyebrow>
        <h2 className="leading-snug font-bold">{labels.skillsTitle}</h2>
        <Card asChild className="gap-0 px-6">
          <Accordion
            type="multiple"
            defaultValue={[copy.skills[0].title]}
            className="site-card cv-skills-card mt-6"
          >
            {copy.skills.map((skill) => (
              <AccordionItem key={skill.title} value={skill.title}>
                <AccordionTrigger>{skill.title}</AccordionTrigger>
                <AccordionContent forceMount>
                  <div className="space-y-4 pt-5">
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
        <CodexProfile locale={locale} />
      </section>
    </div>
  )
}
