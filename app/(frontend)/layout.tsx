import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { BlogHeader } from '@/components/BlogHeader'
import { BlogFooter } from '@/components/BlogFooter'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  title: {
    default: 'Terry Chen',
    template: '%s | Terry Chen',
  },
  description:
    'AI-powered tools from Swift roots to web frontiers. Every commit lands on GitHub for you to fork & remix.',
  authors: [{ name: 'Terry Chen', url: 'https://github.com/terry90918' }],
  creator: 'Terry Chen',
  openGraph: {
    title: 'Terry Chen',
    description:
      'AI-powered tools from Swift roots to web frontiers. Every commit lands on GitHub for you to fork & remix.',
    url: 'https://terry90918.github.io',
    type: 'website',
    locale: 'en_US',
    siteName: 'Terry Chen',
  },
  twitter: {
    card: 'summary',
    title: 'Terry Chen',
    description:
      'AI-powered tools from Swift roots to web frontiers. Every commit lands on GitHub for you to fork & remix.',
    creator: '@zxtw17985321',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Terry Chen" href="/rss.xml" />
      </head>
      <body>
        <GoogleAnalytics measurementId={googleAnalyticsId} />
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <BlogHeader />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
          <BlogFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
