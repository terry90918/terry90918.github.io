import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/script', () => ({
  default: ({ children, id, src }: { children?: string; id?: string; src?: string }) => (
    <span
      data-script-id={id}
      data-script-src={src}
      dangerouslySetInnerHTML={{ __html: children ?? '' }}
    />
  ),
}))
import { GoogleAnalytics } from '../../components/GoogleAnalytics'

describe('Google Analytics integration', () => {
  it('renders the configured GA4 scripts', () => {
    const html = renderToStaticMarkup(<GoogleAnalytics measurementId="G-DY9QLZM89G" />)

    expect(html).toContain('https://www.googletagmanager.com/gtag/js?id=G-DY9QLZM89G')
    expect(html).toContain(`gtag('config', ${JSON.stringify('G-DY9QLZM89G')})`)
  })
})
