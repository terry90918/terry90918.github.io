'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 只在開發環境輸出到 console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      })
    }

    // 生產環境可以發送到分析服務
    // 例如：Google Analytics 等
    switch (metric.name) {
      case 'FCP':
        // First Contentful Paint
        break
      case 'LCP':
        // Largest Contentful Paint
        break
      case 'CLS':
        // Cumulative Layout Shift
        break
      case 'FID':
        // First Input Delay
        break
      case 'TTFB':
        // Time to First Byte
        break
      case 'INP':
        // Interaction to Next Paint
        break
    }
  })

  return null
}
