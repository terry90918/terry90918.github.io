interface PracticeAreaCardProps {
  title: string
  subtitle: string
  description: string
  index: number
}

export function PracticeAreaCard({ title, subtitle, description, index }: PracticeAreaCardProps) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <article className="group relative">
      {/* Background hover effect */}
      <div className="from-accent/0 to-accent/0 group-hover:from-accent/5 absolute inset-0 -mx-8 bg-gradient-to-r px-8 transition-all duration-700 group-hover:to-transparent" />

      <div className="border-text-dark/10 dark:border-text-light/10 relative grid grid-cols-1 gap-6 border-b py-12 md:grid-cols-12 md:gap-12">
        {/* Number */}
        <div className="md:col-span-1">
          <span className="text-accent/30 group-hover:text-accent text-5xl leading-none font-light tracking-tight transition-colors duration-500 md:text-6xl">
            {number}
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="md:col-span-4">
          <h3 className="text-text-dark group-hover:text-primary relative mb-3 text-3xl tracking-[0.1em] transition-colors duration-300 md:text-4xl">
            {title}
          </h3>
          <p className="text-accent text-sm leading-relaxed font-light tracking-[0.1em]">
            {subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-7">
          <p className="text-text-dark dark:text-text-light leading-8 tracking-[0.02em] opacity-80">
            {description}
          </p>
        </div>
      </div>
    </article>
  )
}
