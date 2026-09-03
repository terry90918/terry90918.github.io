import Script from 'next/script'
import { GoogleAnalyticsRouteTracker } from './GoogleAnalyticsRouteTracker'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(measurementId)});`}
      </Script>
      <GoogleAnalyticsRouteTracker measurementId={measurementId} />
    </>
  )
}
