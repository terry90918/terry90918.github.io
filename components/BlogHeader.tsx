'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()

  if (!isClient) {
    return <div className="h-11 w-11" />
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="site-icon-button"
    >
      {resolvedTheme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </Button>
  )
}

export function BlogHeader() {
  const pathname = usePathname()
  const inCv = pathname.startsWith('/cv')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [menuOpen])
  function isCurrentRoute(href: string) {
    return href.startsWith('/') && (pathname === href || pathname.startsWith(`${href}/`))
  }
  const links: [string, string][] = [
    ['關於我', '/about'],
    ['故事', '/story'],
    ['作品', '/work'],
    ['文章', '/posts'],
    ['CV', CV_URL],
  ]
  return (
    <header className="site-header border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <Collapsible open={menuOpen} onOpenChange={setMenuOpen} asChild>
        <div data-testid="header-inner" className="site-header-inner">
          <div className="site-header-row">
            <Link
              href="/"
              prefetch={inCv ? false : undefined}
              className="site-wordmark hover:text-accent-ink shrink-0 rounded-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
            >
              Terry.TY Chen
            </Link>
            <nav aria-label="主要導覽" className="site-header-nav">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  prefetch={inCv || href === CV_URL ? false : undefined}
                  aria-current={isCurrentRoute(href) ? 'page' : undefined}
                  className="hover:text-accent-ink flex min-h-11 items-center rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="site-header-utilities">
              <Link href={SITE_EMAIL} className="site-header-contact site-text-link">
                聯絡 <span aria-hidden="true">↗</span>
              </Link>
              <ThemeToggle />
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  ref={menuButton}
                  type="button"
                  aria-label="導覽選單"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-navigation"
                  className="site-icon-button site-menu-toggle"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    {menuOpen ? (
                      <path d="m6 6 12 12M6 18 18 6" />
                    ) : (
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent asChild forceMount>
            <nav
              id="mobile-navigation"
              aria-label="手機導覽"
              hidden={!menuOpen}
              className="site-mobile-navigation"
            >
              {[...links, ['聯絡', SITE_EMAIL]].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  prefetch={inCv || href === CV_URL ? false : undefined}
                  onClick={closeMenu}
                  aria-current={isCurrentRoute(href) ? 'page' : undefined}
                  className="hover:text-accent-ink flex min-h-11 items-center rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </header>
  )
}
