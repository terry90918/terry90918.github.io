'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { useActiveSection } from '@/hooks/cv/use-active-section'
import { localeHref } from '@/lib/cv/profile'
import type { Locale, Profile } from '@/lib/cv/profile'
import { cn } from '@/lib/cv/utils'
const sectionIds = ['about', 'featured-works', 'experience', 'skills', 'contact']
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
    { id: 'skills', label: labels.skills },
    { id: 'contact', label: labels.contact },
  ]
  const linkClass =
    'flex min-h-9 shrink-0 items-center rounded-full px-2 text-[11px] font-medium whitespace-nowrap transition-colors hover:bg-accent-surface hover:text-accent-ink focus-visible:outline-2 sm:px-3 sm:text-sm'
  const currentFragment = () => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>(
        document.getElementById('case-study-content')
          ? '#case-study-content h2, #case-study-content h3'
          : '.cv-content > section[id]'
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
      className="sticky top-[var(--cv-header-height,4.75rem)] z-40 mx-auto w-fit max-w-[calc(100vw-2rem)]"
    >
      <div className="bg-card flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-full border p-1 shadow-sm">
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
              className={cn(
                linkClass,
                active ? 'bg-accent-surface text-accent-ink' : 'text-muted-foreground'
              )}
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
          className={cn(linkClass, 'border-border text-muted-foreground border-l')}
        >
          <Globe aria-hidden="true" className="mr-1 size-3.5 shrink-0" />
          <span>{locale === 'en' ? '中文' : 'EN'}</span>
        </a>
      </div>
    </nav>
  )
}
