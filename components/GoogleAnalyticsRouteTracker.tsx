'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function GoogleAnalyticsRouteTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const hasMounted = useRef(false)
  const lastPathname = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    if (!hasMounted.current) {
      hasMounted.current = true
      lastPathname.current = pathname
      return
    }

    if (pathname === lastPathname.current) return
    lastPathname.current = pathname

    const gtag =
      window.gtag ??
      ((...args: unknown[]) => {
        window.dataLayer = window.dataLayer ?? []
        window.dataLayer.push(args)
      })
    gtag('config', measurementId, { page_path: pathname })
  }, [measurementId, pathname])

  return null
}
