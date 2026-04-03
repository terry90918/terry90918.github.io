export function Testimonial() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-32">
      {/* Background with gradient */}
      <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent" />

      {/* Decorative elements */}
      <div className="from-accent/5 absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r to-transparent" />
      <div className="from-primary/5 absolute right-0 bottom-0 h-full w-1/3 bg-gradient-to-l to-transparent" />

      <div className="relative mx-auto max-w-5xl px-8 md:px-16">
        {/* Section label */}
        <div className="mb-12 flex items-center justify-center gap-4">
          <div className="bg-accent h-px w-16" />
          <span className="text-accent text-xs font-medium tracking-[0.3em] uppercase">
            委託人推薦
          </span>
          <div className="bg-accent h-px w-16" />
        </div>

        {/* Quote */}
        <div className="relative">
          {/* Large decorative quote mark */}
          <div className="font-display text-accent/10 pointer-events-none absolute -top-8 -left-4 text-[10rem] leading-none select-none md:-left-12 md:text-[15rem]">
            「
          </div>

          <blockquote className="relative z-10 text-center">
            <p className="text-text-dark mb-12 text-2xl leading-[1.8] font-light tracking-[0.08em] md:text-3xl lg:text-4xl">
              尹惠律師不只是讀懂法律，她更能
              <span className="text-accent">洞察現場氛圍</span>
              、理解情境脈絡、
              <span className="text-primary">體察當事人的心情</span>
              。她是難得兼具敏銳思維與深厚同理心的律師。
            </p>

            {/* Attribution */}
            <footer className="flex flex-col items-center gap-4">
              <div className="bg-accent/50 h-px w-16" />
              <cite className="not-italic">
                <span className="text-text-dark dark:text-text-light block text-sm tracking-[0.2em] uppercase opacity-80">
                  匿名委託人
                </span>
                <span className="text-accent mt-1 block text-xs tracking-wider">
                  家事法案件 · 2023
                </span>
              </cite>
            </footer>
          </blockquote>

          {/* Closing quote mark */}
          <div className="font-display text-accent/10 pointer-events-none absolute -right-4 -bottom-8 rotate-180 text-[10rem] leading-none select-none md:-right-12 md:text-[15rem]">
            「
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-accent mb-2 text-3xl leading-none font-light tracking-tight md:text-4xl">
              98%
            </div>
            <div className="text-text-dark/50 text-[0.7rem] tracking-[0.25em] uppercase">
              客戶滿意度
            </div>
          </div>
          <div className="bg-text-dark/10 hidden h-16 w-px md:block" />
          <div className="text-center">
            <div className="text-primary mb-2 text-3xl leading-none font-light tracking-tight md:text-4xl">
              4.9
            </div>
            <div className="text-text-dark/50 text-[0.7rem] tracking-[0.25em] uppercase">
              Google 評分
            </div>
          </div>
          <div className="bg-text-dark/10 hidden h-16 w-px md:block" />
          <div className="text-center">
            <div className="text-accent mb-2 text-3xl leading-none font-light tracking-tight md:text-4xl">
              85%
            </div>
            <div className="text-text-dark/50 text-[0.7rem] tracking-[0.25em] uppercase">
              回頭客比例
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
