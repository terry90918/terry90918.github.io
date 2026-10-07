import Eyebrow from '@/components/cv/shared/eyebrow/eyebrow'
import Timeline from '@/components/cv/ui/timeline'
import type { Profile } from '@/lib/cv/profile'
export default function Experience({ profile }: { profile: Profile }) {
  return (
    <section id="experience" className="min-w-0 border-b px-4 py-12 sm:px-6 sm:py-24 lg:px-10.5">
      <Eyebrow>{profile.labels.experience}</Eyebrow>
      <h2 className="mt-2 text-2xl leading-snug font-semibold md:text-3xl lg:text-4xl">
        {profile.labels.experienceTitle}
      </h2>
      <Timeline
        data={profile.experiences.map((experience, index) => ({
          index: String(index + 1).padStart(2, '0'),
          content: (
            <article className="space-y-5">
              <div>
                <p className="text-muted-foreground text-sm">{experience.company}</p>
                <h3 className="mt-2 text-xl font-semibold sm:text-2xl">{experience.role}</h3>
                <p className="text-muted-foreground mt-3 text-xs leading-relaxed sm:text-sm">
                  {experience.period} · {experience.kind}
                  {experience.team && ` · ${experience.team}`}
                </p>
              </div>
              <ul className="space-y-4">
                {experience.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="text-muted-foreground flex items-start gap-3 text-sm leading-relaxed sm:text-base"
                  >
                    <span className="bg-accent mt-2.5 size-1 shrink-0 rounded-full" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {experience.projects.map((project) => (
                <div key={project.name} className="bg-card rounded-2xl border p-4 sm:p-5">
                  <h4 className="text-base font-medium">{project.name}</h4>
                  <p className="text-muted-foreground mt-2 text-xs">{project.period}</p>
                  <ul className="mt-4 space-y-3">
                    {project.bullets.map((bullet) => (
                      <li key={bullet} className="text-muted-foreground text-sm leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ),
        }))}
      />
    </section>
  )
}
