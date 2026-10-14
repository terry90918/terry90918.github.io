import { satoshi } from '@/lib/site/fonts'
import { SiteShell } from '@/components/SiteShell'
import NavDock from '@/components/cv/layout/nav-dock'
import CustomCursor from '@/components/cv/layout/custom-cursor'
import EdgeBlur from '@/components/cv/layout/edge-blur'
import { profiles, type Locale } from '@/lib/cv/profile'
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
      className={`${satoshi.variable} min-h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="cv-site">
        <SiteShell>
          <NavDock locale={locale} labels={profiles[locale].labels} />
          <main className="cv-content mx-auto flex w-full max-w-4xl min-w-0 flex-1 flex-col lg:border-x xl:max-w-245">
            {children}
          </main>
          <EdgeBlur />
          <CustomCursor />
        </SiteShell>
      </body>
    </html>
  )
}
