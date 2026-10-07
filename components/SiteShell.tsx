import { ThemeProvider } from '@/components/ThemeProvider'
import { BlogHeader } from '@/components/BlogHeader'
import { BlogFooter } from '@/components/BlogFooter'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        <BlogHeader />
        {children}
        <BlogFooter />
      </ThemeProvider>
    </>
  )
}
