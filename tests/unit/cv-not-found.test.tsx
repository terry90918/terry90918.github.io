import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import NotFound from '@/app/(cv)/cv/[locale]/not-found'

vi.mock('next/navigation', () => ({ usePathname: () => '/cv/en/case-study/unknown' }))

it('keeps the English CV error page and return link in English', () => {
  const html = renderToStaticMarkup(<NotFound />)
  expect(html).toContain('Page not found')
  expect(html).toContain('href="/cv/en"')
})
