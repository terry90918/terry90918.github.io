'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useIsClient } from '@/hooks/useIsClient'

export function Hero() {
  const { resolvedTheme } = useTheme()
  const isClient = useIsClient()

  // Design System 顏色
  const bgColor = resolvedTheme === 'dark' ? '#2c3530' : '#e6e4e1'

  return (
    <header
      className="bg-background-light dark:bg-background-dark relative min-h-screen w-full overflow-hidden"
      style={isClient ? { backgroundColor: bgColor } : undefined}
    >
      {/* Full-screen Portrait Background - Person Centered */}
      <div className="absolute inset-0 z-[1] h-full w-full md:z-0">
        <div className="relative h-full w-full">
          <Image
            src="/hero-portrait.png"
            alt="劉尹惠律師"
            fill
            priority
            fetchPriority="high"
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        </div>
        {/* 左邊漸層 - 融合至背景色 */}
        <div
          className="from-background-light via-background-light dark:from-background-dark dark:via-background-dark pointer-events-none absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r to-transparent"
          style={
            isClient
              ? {
                  background: `linear-gradient(to right, ${bgColor} 0%, ${bgColor} 30%, transparent 100%)`,
                }
              : undefined
          }
        />
        {/* 右邊漸層 - 融合至背景色 */}
        <div
          className="from-background-light via-background-light dark:from-background-dark dark:via-background-dark pointer-events-none absolute inset-y-0 right-0 w-[45%] bg-gradient-to-l to-transparent"
          style={
            isClient
              ? {
                  background: `linear-gradient(to left, ${bgColor} 0%, ${bgColor} 30%, transparent 100%)`,
                }
              : undefined
          }
        />
      </div>

      {/* Large Decorative Vertical Text - Right Side (behind portrait on mobile) */}
      <div className="pointer-events-none absolute top-0 right-0 z-0 flex h-full items-center md:z-10">
        <div className="vertical-text text-text-dark/20 dark:text-text-light/20 translate-x-[35%] text-[8rem] leading-none font-bold tracking-[0.02em] select-none md:translate-x-[20%] md:text-[14rem] lg:text-[18rem]">
          律師
        </div>
      </div>

      {/* Secondary Vertical Text (behind portrait on mobile) */}
      <div className="pointer-events-none absolute top-0 right-[5%] z-0 flex h-full items-center md:right-[18%] md:z-10">
        <div className="vertical-text text-primary/40 dark:text-primary/50 text-[4rem] leading-none font-light tracking-[0.05em] select-none md:text-[7rem] lg:text-[9rem]">
          劉尹惠
        </div>
      </div>

      {/* Text Content - Bottom Left */}
      <div className="absolute bottom-0 left-0 z-20 p-8 pb-16 md:p-16 md:pb-24 lg:p-24">
        {/* Tag */}
        <div className="animate-fade-up mb-4 [animation-delay:100ms]">
          <span className="text-primary inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase">
            <span className="bg-primary h-px w-8" />
            新竹律師
          </span>
        </div>

        {/* Name */}
        <h1 className="text-text-dark dark:text-text-light animate-fade-up mb-4 text-[2.5rem] leading-[1.1] [animation-delay:200ms] md:text-[3.5rem] lg:text-[4.5rem]">
          <span className="block font-light">劉</span>
          <span className="text-primary block font-bold">尹惠</span>
          <span className="text-text-dark/70 dark:text-text-light/70 mt-2 block text-xl font-light md:text-2xl">
            律師
          </span>
        </h1>

        {/* Tagline */}
        <div className="animate-fade-up mb-6 [animation-delay:300ms]">
          <p className="text-text-dark/80 dark:text-text-light/80 max-w-sm text-base leading-relaxed md:text-lg">
            <span className="text-primary font-medium">以同理心為依歸的辯護。</span>
            <br />
            架起法條與故事的橋樑。
          </p>
        </div>

        {/* CTA */}
        <div className="animate-fade-up [animation-delay:400ms]">
          <a
            href="#contact"
            className="bg-primary hover:bg-primary/90 group inline-flex items-center gap-4 px-6 py-3 text-white transition-all duration-500"
          >
            <span className="text-sm tracking-widest uppercase">預約諮詢</span>
            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-2">
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="via-primary/30 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent" />
    </header>
  )
}
