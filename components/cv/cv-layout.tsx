import { satoshi } from '@/lib/site/fonts'
import { geist, geistMono } from '@/lib/site/typeset-fonts'
import { SiteShell } from '@/components/SiteShell'
import NavDock from '@/components/cv/layout/nav-dock'
import CustomCursor from '@/components/cv/layout/custom-cursor'
import { profiles, type Locale } from '@/lib/cv/profile'
import reference from '@/lib/site/design-reference.json'
import '../../app/(frontend)/globals.css'

export default function CvLayout({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: Locale
}) {
  return (
    <html
      lang={locale}
      className={`${satoshi.variable} ${geist.variable} ${geistMono.variable} min-h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="cv-site">
        <SiteShell>
          <NavDock
            locale={locale}
            labels={{ ...profiles[locale].labels, ...reference.cv[locale].labels }}
          />
          <main className="cv-content mx-auto flex w-full max-w-[var(--editorial-width)] min-w-0 flex-1 flex-col px-5 min-[701px]:px-8">
            {children}
          </main>
          <CustomCursor />
        </SiteShell>
      </body>
    </html>
  )
}
