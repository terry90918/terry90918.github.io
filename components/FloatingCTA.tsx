'use client'

import { useScrollY } from '@/hooks/useScrollY'
import { useIsClient } from '@/hooks/useIsClient'

export function FloatingCTA() {
  const scrollY = useScrollY()
  const isClient = useIsClient()

  // 捲動超過半個視窗高度後顯示
  const isVisible = isClient && scrollY > window.innerHeight * 0.5

  return (
    <div
      className={`fixed right-8 bottom-8 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <a
        href="#contact"
        className="group bg-accent shadow-accent/30 hover:shadow-accent/50 hover:bg-primary relative flex items-center gap-3 overflow-hidden py-4 pr-5 pl-6 text-white shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]"
      >
        {/* 懸停光暈效果 */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <span className="relative text-sm font-medium tracking-wide">預約諮詢</span>
        <span className="material-symbols-outlined relative text-lg transition-transform duration-300 group-hover:rotate-45">
          arrow_outward
        </span>
      </a>
    </div>
  )
}
