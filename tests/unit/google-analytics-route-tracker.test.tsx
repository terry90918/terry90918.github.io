import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }))

vi.mock('next/navigation', () => ({ usePathname }))

import { GoogleAnalyticsRouteTracker } from '../../components/GoogleAnalyticsRouteTracker'

describe('Google Analytics route tracking', () => {
  let container: HTMLDivElement
  let root: Root
  let pathname: string
  let gtag: ReturnType<typeof vi.fn<(...args: unknown[]) => void>>

  beforeEach(() => {
    pathname = '/'
    usePathname.mockReturnValue(pathname)
    gtag = vi.fn<(...args: unknown[]) => void>()
    window.gtag = gtag
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it('sends the new pathname when navigation changes the route', async () => {
    await act(async () => {
      root.render(<GoogleAnalyticsRouteTracker measurementId="G-DY9QLZM89G" />)
    })

    pathname = '/posts/'
    usePathname.mockReturnValue(pathname)

    await act(async () => {
      root.render(<GoogleAnalyticsRouteTracker measurementId="G-DY9QLZM89G" />)
    })

    expect(gtag).toHaveBeenCalledWith('config', 'G-DY9QLZM89G', {
      page_path: '/posts/',
    })
  })
})
