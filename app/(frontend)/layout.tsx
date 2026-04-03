import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { BlogHeader } from '@/components/BlogHeader'
import { BlogFooter } from '@/components/BlogFooter'

export const metadata: Metadata = {
  title: {
    default: 'Terry Chen',
    template: '%s | Terry Chen',
  },
  description: 'Building AI agent systems and MCP tooling in Taiwan. Every commit lands on GitHub.',
  authors: [{ name: 'Terry Chen', url: 'https://github.com/terry90918' }],
  creator: 'Terry Chen',
  openGraph: {
    title: 'Terry Chen',
    description:
      'Building AI agent systems and MCP tooling in Taiwan. Every commit lands on GitHub.',
    url: 'https://terry90918.dev',
    type: 'website',
    locale: 'en_US',
    siteName: 'Terry Chen',
  },
  twitter: {
    card: 'summary',
    title: 'Terry Chen',
    description:
      'Building AI agent systems and MCP tooling in Taiwan. Every commit lands on GitHub.',
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
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <BlogHeader />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
          <BlogFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
