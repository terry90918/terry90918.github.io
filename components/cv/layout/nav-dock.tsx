'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { useActiveSection } from '@/hooks/cv/use-active-section'
import { localeHref } from '@/lib/cv/profile'
import type { Locale, Profile } from '@/lib/cv/profile'
import { cn } from '@/lib/utils'
const sectionIds = ['about', 'featured-works', 'experience', 'contact', 'skills']
export default function NavDock({ locale, labels }: { locale: Locale; labels: Profile['labels'] }) {
  const navigationRef = useRef<HTMLElement>(null)
  const currentPath = usePathname().replace(/\/$/, '')
  const pathname = currentPath === '/cv' ? `/cv/${locale}` : currentPath
  const activeId = useActiveSection(sectionIds, pathname)
  const [fragment, setFragment] = useState('')
  const targetLocale = locale === 'en' ? 'zh-TW' : 'en'
  useEffect(() => {
    const header = document.querySelector('header')
    const navigation = navigationRef.current
    if (!header || !navigation) return
    const measure = () => {
      document.body.style.setProperty(
        '--cv-header-height',
        `${header.getBoundingClientRect().height}px`
      )
      document.body.style.setProperty(
        '--cv-section-nav-height',
        `${navigation.getBoundingClientRect().height}px`
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    observer.observe(navigation)
    return () => observer.disconnect()
  }, [])
  const items = [
    { id: 'about', label: labels.about },
    { id: 'featured-works', label: labels.work },
    { id: 'experience', label: labels.experience },
    { id: 'contact', label: labels.contact },
    { id: 'skills', label: labels.skills },
  ]
  const linkClass =
    'cv-section-link flex min-h-7 shrink-0 items-center whitespace-nowrap hover:text-accent-ink focus-visible:outline-2'
  const currentFragment = () => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>(
        document.getElementById('case-study-content')
          ? '#case-study-content h2, #case-study-content h3'
          : '.cv-home-reference > section[id]'
      ),
    ]
    const requested = sections.find(
      (section) =>
        window.location.hash === `#${section.id}` ||
        window.location.hash === `#${encodeURIComponent(section.id)}`
    )
    if (requested) {
      const top = requested.getBoundingClientRect().top
      if (top >= 0 && top < window.innerHeight) return window.location.hash
    }
    const active = sections
      .reverse()
      .find(
        (section) =>
          section.getBoundingClientRect().top <=
          parseFloat(getComputedStyle(section).scrollMarginTop) + 8
      )
    return active ? `#${active.id}` : window.location.hash
  }
  const switchLanguage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = localeHref(pathname, targetLocale, currentFragment())
  }
  return (
    <nav
      ref={navigationRef}
      aria-label={locale === 'en' ? 'CV sections' : '履歷章節'}
      className="cv-section-navigation sticky top-[var(--cv-header-height,4.75rem)] z-40 mx-auto w-full max-w-[var(--editorial-width)] px-5 min-[701px]:px-8"
    >
      <div className="border-border bg-background flex max-w-full items-center gap-6 overflow-x-auto border-b py-4 max-[700px]:gap-5 max-[700px]:py-2.5">
        {items.map(({ id, label }) => {
          const href = `/cv/${locale}/#${id}`
          const active =
            (pathname === `/cv/${locale}` && activeId === id) ||
            (id === 'contact' && pathname === `/cv/${locale}/contact`)
          return (
            <Link
              key={id}
              href={href}
              aria-label={label}
              aria-current={active ? 'location' : undefined}
              className={cn(linkClass, active ? 'text-accent-ink font-bold' : 'text-foreground')}
            >
              {label}
            </Link>
          )
        })}
        <a
          href={localeHref(pathname, targetLocale, fragment)}
          onPointerEnter={() => setFragment(currentFragment())}
          onFocus={() => setFragment(currentFragment())}
          hrefLang={targetLocale}
          onClick={switchLanguage}
          aria-label={locale === 'en' ? '切換至繁體中文' : 'Switch to English'}
          className={cn(linkClass, 'text-muted-foreground ml-auto')}
        >
          <Globe aria-hidden="true" className="mr-1 size-3.5 shrink-0" />
          <span>{locale === 'en' ? '中文' : 'EN'}</span>
        </a>
      </div>
    </nav>
  )
}
