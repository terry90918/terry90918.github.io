import type { Metadata } from 'next'
import './globals.css'
import { WebVitals } from './web-vitals'
import { notoSans, notoSerif } from './fonts'
import { FontLoader } from '@/components/FontLoader'
import { ThemeProvider } from '@/components/ThemeProvider'

/** 法律服務項目（用於 JSON-LD 結構化資料與 knowsAbout） */
const LEGAL_SERVICES: Array<{ name: string; description: string }> = [
  { name: '民事訴訟', description: '處理各類民事糾紛訴訟案件' },
  { name: '刑事辯護', description: '提供刑事案件辯護服務' },
  { name: '婚姻家事', description: '處理離婚、監護權等家事案件' },
  { name: '遺產繼承', description: '協助遺產分配與繼承事務' },
  { name: '房地糾紛', description: '處理不動產相關法律糾紛' },
  { name: '契約審閱', description: '提供各類契約審閱與諮詢' },
  { name: '法人顧問', description: '擔任企業法律顧問' },
]

export const metadata: Metadata = {
  title: '劉尹惠律師 | 新竹律師 | 民事、刑事、婚姻、繼承法律服務',
  description:
    '劉尹惠律師位於新竹竹北，專精民事訴訟、刑事辯護、婚姻家事、遺產繼承、房地糾紛、契約審閱及法人顧問。超過10年執業經驗，以同理心為依歸的辯護，架起法條與故事的橋樑。預約諮詢：03-657-5067',
  keywords: [
    '新竹律師',
    '竹北律師',
    '劉尹惠律師',
    '民事訴訟律師',
    '刑事辯護律師',
    '離婚律師',
    '婚姻家事律師',
    '遺產繼承律師',
    '房地產律師',
    '契約審閱',
    '法人顧問',
    '新竹法律事務所',
  ],
  authors: [{ name: '劉尹惠律師' }],
  creator: '劉尹惠律師',
  openGraph: {
    title: '劉尹惠律師 | 新竹專業法律服務',
    description:
      '新竹竹北專業律師，提供民事訴訟、刑事辯護、婚姻家事、遺產繼承、房地糾紛、契約審閱及法人顧問服務。預約諮詢：03-657-5067',
    url: 'https://lawyer.jurislm.com',
    type: 'website',
    locale: 'zh_TW',
    siteName: '劉尹惠律師',
    images: [
      {
        url: 'https://lawyer.jurislm.com/og-image.png',
        width: 1200,
        height: 630,
        alt: '劉尹惠律師 - 新竹專業法律服務',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '劉尹惠律師 | 新竹專業法律服務',
    description: '新竹竹北專業律師，提供民事、刑事、婚姻、繼承等全方位法律服務。',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://lawyer.jurislm.com',
  },
  other: {
    'theme-color': '#6A7E72',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-TW"
      className={`${notoSans.variable} ${notoSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS 預解析與預連線 */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['LocalBusiness', 'LegalService'],
              '@id': 'https://lawyer.jurislm.com',
              name: '劉尹惠律師事務所',
              image: 'https://lawyer.jurislm.com/og-image.png',
              description:
                '新竹竹北專業律師，提供民事訴訟、刑事辯護、婚姻家事、遺產繼承、房地糾紛、契約審閱及法人顧問服務。',
              url: 'https://lawyer.jurislm.com',
              telephone: '+886-3-657-5067',
              email: 'eva.liu@jurislm.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '縣政九路135巷32號3樓',
                addressLocality: '竹北市',
                addressRegion: '新竹縣',
                postalCode: '302',
                addressCountry: 'TW',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 24.8385,
                longitude: 121.0177,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '09:00',
                  closes: '18:00',
                },
              ],
              priceRange: '$$',
              areaServed: [
                { '@type': 'City', name: '新竹市' },
                { '@type': 'City', name: '竹北市' },
                { '@type': 'State', name: '新竹縣' },
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: '法律服務',
                itemListElement: LEGAL_SERVICES.map((svc) => ({
                  '@type': 'Offer',
                  itemOffered: { '@type': 'Service', ...svc },
                })),
              },
              founder: {
                '@type': 'Person',
                name: '劉尹惠',
                jobTitle: '律師',
                knowsAbout: LEGAL_SERVICES.map((svc) => svc.name),
              },
              sameAs: [
                'https://www.facebook.com/liuyin.hui.law/',
              ],
            }).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-body text-text-dark dark:text-text-light selection:bg-accent overflow-x-hidden antialiased selection:text-white">
        <ThemeProvider>
          <FontLoader />
          <WebVitals />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
