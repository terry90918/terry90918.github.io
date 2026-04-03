'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useScrollY } from '@/hooks/useScrollY'

const navLinkClass =
  'border-primary text-primary hover:!bg-primary border bg-transparent px-5 py-2 text-sm font-medium transition-all duration-300 hover:!text-white motion-reduce:transition-none'

export function Navigation() {
  const scrolled = useScrollY() > 100

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 motion-reduce:transition-none ${
        scrolled
          ? 'bg-background-light/95 dark:bg-background-dark/95 py-4 shadow-sm backdrop-blur-md'
          : 'py-6'
      }`}
    >
      <div className="flex items-center justify-between px-8 md:px-16 lg:px-24">
        <a
          href="#"
          className="text-text-dark dark:text-text-light flex items-center gap-3 transition-colors duration-300 motion-reduce:transition-none"
        >
          <div className="border-primary flex h-10 w-10 items-center justify-center border bg-white/50 dark:bg-white/10">
            <span className="text-primary text-lg font-bold">劉</span>
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-xs font-medium tracking-[0.2em]">劉尹惠</span>
            <span className="text-text-dark/70 dark:text-text-light/70 text-[10px] tracking-wider">
              律師事務所
            </span>
          </div>
        </a>

        <div className="flex items-center gap-4">
          <Link href="/articles" className={navLinkClass}>
            法律新知
          </Link>
          <a href="#contact" className={navLinkClass}>
            聯絡我們
          </a>
          <ThemeToggle scrolled={scrolled} />
        </div>
      </div>
    </nav>
  )
}
