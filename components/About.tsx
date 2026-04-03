export function About() {
  return (
    <section id="about" className="relative overflow-hidden px-8 py-32 md:px-16 lg:px-24">
      {/* Background decoration */}
      <div className="from-accent/5 pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-24">
          {/* Left Content */}
          <div className="relative lg:col-span-5">
            {/* Section label */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-accent text-xs font-medium tracking-[0.3em] uppercase">01</span>
              <div className="bg-accent h-px w-16" />
              <span className="text-text-dark/50 dark:text-text-light/50 text-xs tracking-[0.2em] uppercase">
                執業理念
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-text-dark font-display mb-8 text-5xl leading-[1.1] md:text-6xl lg:text-7xl">
              法律，
              <br />
              <span className="text-accent text-5xl leading-relaxed font-light tracking-[0.1em] md:text-6xl lg:text-7xl">
                是故事的集合
              </span>
            </h2>

            {/* Description */}
            <div className="border-accent/30 relative border-l-2 pl-6">
              <p className="text-text-dark/70 text-lg leading-[1.8] font-light tracking-[0.08em] md:text-xl">
                法律不僅僅是冰冷的規則框架，更是人生故事的集合。我致力於在複雜的法條與當事人細膩的需求之間，搭建理解與溝通的橋樑。
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="group">
                <div className="text-accent mb-2 origin-left text-4xl leading-none font-light tracking-tight transition-transform duration-300 group-hover:scale-110 md:text-5xl">
                  10+
                </div>
                <div className="text-text-dark/50 text-[0.7rem] tracking-[0.25em] uppercase">
                  年執業經驗
                </div>
              </div>
              <div className="group">
                <div className="text-accent mb-2 origin-left text-4xl leading-none font-light tracking-tight transition-transform duration-300 group-hover:scale-110 md:text-5xl">
                  1000+
                </div>
                <div className="text-text-dark/50 text-[0.7rem] tracking-[0.25em] uppercase">
                  服務案件
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:col-span-7">
            {/* Decorative frame */}
            <div className="border-accent/50 absolute -top-6 -left-6 z-10 h-32 w-32 border-t-2 border-l-2" />
            <div className="border-primary/50 absolute -right-6 -bottom-6 z-10 h-32 w-32 border-r-2 border-b-2" />

            {/* Image container */}
            <div className="group relative aspect-[4/5] overflow-hidden">
              <div
                className="h-full w-full bg-cover bg-center grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvYyQed4nyla_SchRNN5EXPtR-eooCbWwdpPP0ssYOtQ6rwt7P8xTlr0--rza2a1waHITk6AHNfbOllW-Wlc7fNUZcTmz8KADD0YN7IPTEMjGFINBD8q7It9yGONlGZZAU8qEXbhxFVsD7Nf6FIYh3V_HcgXWOT3A3UW6L8hus7DGEirQ6TGZ-t4azKwTklZD4B7zM_FBnMAL6krpNdJrmG1B49Kh2wMjDXiLT7j12gcoHF8jxPC-r70busYNGgzmkFkx-mtUIQ_oi')",
                }}
              />
              {/* Overlay on hover */}
              <div className="bg-accent/0 group-hover:bg-accent/10 absolute inset-0 transition-colors duration-500" />
            </div>

            {/* Caption */}
            <div className="bg-background-light dark:bg-background-dark absolute -bottom-4 left-8 px-6 py-3 shadow-lg">
              <p className="text-accent text-xs tracking-[0.2em] uppercase">創立於 2010 · 新竹</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
