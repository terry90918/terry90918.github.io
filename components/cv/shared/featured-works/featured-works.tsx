import type { CaseStudyMetadata } from '@/lib/cv/case-studies'
import type { Locale } from '@/lib/cv/profile'
import Eyebrow from '@/components/cv/shared/eyebrow/eyebrow'
import FeaturedWorkCard from './featured-work-card'
import { cn } from '@/lib/cv/utils'
type FeaturedWorksProps = {
  caseStudies: CaseStudyMetadata[]
  locale: Locale
  id?: string
  eyebrow: string
  title: string
  layout?: 'bento' | 'vertical'
  showBorder?: boolean
}
const CYCLE_SIZE = 3
const chunkIntoCycles = (caseStudies: CaseStudyMetadata[]): CaseStudyMetadata[][] => {
  const cycles: CaseStudyMetadata[][] = []
  for (let i = 0; i < caseStudies.length; i += CYCLE_SIZE) {
    cycles.push(caseStudies.slice(i, i + CYCLE_SIZE))
  }
  return cycles
}
const FeaturedWorks = ({
  caseStudies,
  locale,
  id = 'featured-works',
  eyebrow,
  title,
  layout = 'bento',
  showBorder = true,
}: FeaturedWorksProps) => {
  return (
    <section id={id} className={cn('py-8 sm:py-16 lg:py-24', showBorder && 'border-b')}>
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-16 lg:px-10.5">
        <div className="space-y-2">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">{title}</h2>
        </div>

        {layout === 'vertical' ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {caseStudies.map((caseStudy) => (
              <FeaturedWorkCard
                key={caseStudy.slug}
                caseStudy={caseStudy}
                locale={locale}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {chunkIntoCycles(caseStudies).map((cycle, cycleIndex) => (
              <div key={cycle[0].slug} className="space-y-8">
                <FeaturedWorkCard
                  caseStudy={cycle[0]}
                  locale={locale}
                  variant="hero"
                  imageSide={cycleIndex % 2 === 0 ? 'right' : 'left'}
                />

                {cycle.length > 1 && (
                  <div className="grid gap-8 sm:grid-cols-2">
                    {cycle.slice(1).map((caseStudy) => (
                      <FeaturedWorkCard
                        key={caseStudy.slug}
                        caseStudy={caseStudy}
                        locale={locale}
                        variant="grid"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
export default FeaturedWorks
