export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden px-8 py-32 md:px-16 lg:px-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="via-accent/30 absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent" />
        <div className="from-accent/8 absolute top-1/2 right-0 h-1/2 w-1/3 bg-gradient-to-l to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left side - CTA */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="text-accent text-sm font-semibold tracking-[0.3em] uppercase">
                03
              </span>
              <div className="bg-accent h-px w-16" />
              <span className="text-text-dark dark:text-text-light text-sm font-medium tracking-[0.2em] uppercase">
                聯繫我們
              </span>
            </div>

            <h2 className="text-text-dark mb-8 text-5xl leading-tight font-light md:text-6xl lg:text-7xl dark:text-white">
              讓我們
              <br />
              <span className="text-accent font-medium italic">開始對話</span>
            </h2>

            <p className="text-text-dark dark:text-text-light mb-12 max-w-md text-lg leading-relaxed">
              無論您面臨何種法律挑戰，我們都願意傾聽。預約免費初步諮詢，讓我們一同探討最適合您的解決方案。
            </p>

            <a
              href="https://lin.ee/nicHsmR"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary group inline-flex items-center gap-4 px-8 py-5 text-white shadow-lg transition-all duration-500 hover:bg-[#5a6e62] hover:shadow-xl"
            >
              <span className="text-sm font-semibold tracking-widest uppercase">預約諮詢</span>
              <span className="material-symbols-outlined text-xl transition-transform duration-300 group-hover:translate-x-2">
                arrow_forward
              </span>
            </a>
          </div>

          {/* Right side - Contact Info */}
          <div className="lg:pt-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ContactCard icon="location_on" label="事務所">
                <p className="text-text-dark dark:text-text-light text-base leading-relaxed font-medium">
                  新竹縣竹北市
                  <br />
                  縣政九路135巷32號3樓
                </p>
                <p className="text-text-secondary dark:text-text-secondary-dark mt-2 text-sm">
                  302 台灣
                </p>
              </ContactCard>

              <ContactCard icon="call" label="電話">
                <a
                  href="tel:+88636575067"
                  className="text-text-dark dark:text-text-light hover:text-accent text-xl font-semibold underline decoration-transparent transition-colors hover:decoration-current"
                >
                  03-657-5067
                </a>
              </ContactCard>

              <ContactCard icon="schedule" label="營業時間">
                <p className="text-text-dark dark:text-text-light text-base font-medium">
                  週一至週五
                </p>
                <p className="text-text-secondary dark:text-text-secondary-dark mt-1 text-sm">
                  09:00 - 18:00
                </p>
              </ContactCard>

              <ContactCard icon="apartment" label="所屬事務所">
                <a
                  href="https://zenda-law.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link text-text-dark dark:text-text-light hover:text-accent inline-flex items-center gap-2 font-medium transition-colors"
                >
                  <span className="text-base">仁大法律事務所</span>
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1">
                    arrow_outward
                  </span>
                </a>
              </ContactCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactCard({
  icon,
  label,
  children,
}: {
  icon: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="group border-text-dark/10 dark:border-text-light/10 hover:border-accent/40 border bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 dark:bg-white/5">
      <div className="mb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-accent text-2xl">{icon}</span>
        <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">{label}</span>
      </div>
      {children}
    </div>
  )
}
