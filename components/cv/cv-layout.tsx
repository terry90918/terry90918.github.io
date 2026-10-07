import localFont from 'next/font/local'
import { SiteShell } from '@/components/SiteShell'
import NavDock from '@/components/cv/layout/nav-dock'
import CustomCursor from '@/components/cv/layout/custom-cursor'
import EdgeBlur from '@/components/cv/layout/edge-blur'
import { profiles, type Locale } from '@/lib/cv/profile'
import '../../app/(frontend)/globals.css'

const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  preload: false,
  src: [
    { path: '../../assets/cv/fonts/satoshi/satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../../assets/cv/fonts/satoshi/satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../../assets/cv/fonts/satoshi/satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../../assets/cv/fonts/satoshi/satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
})

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
