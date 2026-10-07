import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/cv/ui/card'
import type { CaseStudyMetadata } from '@/lib/cv/case-studies'
import type { Locale } from '@/lib/cv/profile'
import { cn } from '@/lib/cv/utils'
export default function FeaturedWorkCard({
  caseStudy,
  locale,
  variant = 'grid',
  imageSide = 'right',
}: {
  caseStudy: CaseStudyMetadata
  locale: Locale
  variant?: 'hero' | 'grid'
  imageSide?: 'left' | 'right'
}) {
  const isHero = variant === 'hero'
  return (
    <Link
      href={`/cv/${locale}/case-study/${caseStudy.slug}#case-study-top`}
      className="block h-full"
    >
      <Card
        className={cn(
          'group ring-border h-full gap-0 overflow-hidden rounded-3xl p-0 shadow-lg',
          isHero && (imageSide === 'left' ? 'md:flex-row-reverse' : 'md:flex-row')
        )}
      >
        <div
          className={cn(
            'order-2 flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6',
            isHero && 'sm:py-8 md:order-0 md:w-1/2'
          )}
        >
          <div>
            <p className="text-accent-ink mb-3 text-xs font-medium">{caseStudy.organisation}</p>
            <h3 className="text-xl leading-snug font-medium md:text-2xl">{caseStudy.title}</h3>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              {caseStudy.description}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <div>
              <p className="text-muted-foreground text-xs">{caseStudy.duration}</p>
              <p className="mt-2 text-xs leading-relaxed">{caseStudy.role}</p>
            </div>
            <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
        <div
          className={cn(
            'relative order-1 flex min-h-60 flex-col justify-between overflow-hidden bg-(--background-darker) p-7 sm:p-8',
            isHero && 'md:order-0 md:w-1/2'
          )}
        >
          <span className="font-mono text-xs tracking-widest uppercase">{caseStudy.brand}</span>
          <div className="my-8">
            <p className="text-accent-ink text-5xl font-semibold tracking-tight sm:text-6xl">
              {caseStudy.metric}
            </p>
            <p className="text-muted-foreground mt-4 max-w-60 text-sm leading-relaxed">
              {caseStudy.metricLabel}
            </p>
          </div>
          <div className="border-accent/30 absolute -right-12 -bottom-12 size-44 rounded-full border-24 opacity-30" />
          <span className="text-muted-foreground relative font-mono text-[10px] tracking-widest uppercase">
            {caseStudy.tools.join(' / ')}
          </span>
        </div>
      </Card>
    </Link>
  )
}
