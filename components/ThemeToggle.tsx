'use client'

import { useTheme } from 'next-themes'
import { useIsClient } from '@/hooks/useIsClient'

interface ThemeToggleProps {
  scrolled?: boolean
}

export function ThemeToggle({ scrolled = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()

  if (!isClient) {
    return <div className="h-10 w-10" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`hover:bg-accent/20 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
        scrolled ? 'text-text-dark dark:text-text-light' : 'text-white'
      }`}
      aria-label="切換主題"
    >
      <span className="material-symbols-outlined text-xl">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}
