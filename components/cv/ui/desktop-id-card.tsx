'use client'

import { useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import type { IdCardProps } from './id-card'

const IdCard = dynamic(() => import('./id-card'), { ssr: false })
const desktopQuery = '(min-width: 64rem)'

function subscribe(callback: () => void) {
  const media = window.matchMedia(desktopQuery)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export default function DesktopIdCard(props: IdCardProps) {
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(desktopQuery).matches,
    () => false
  )
  return desktop ? <IdCard {...props} /> : null
}
