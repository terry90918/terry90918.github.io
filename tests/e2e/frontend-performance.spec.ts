import { expect, test } from '@playwright/test'

test('reading the CV does not preload a different root application', async ({ page }) => {
  const mainRequests: string[] = []
  page.on('request', (request) => {
    if (/^\/(about|story|work|posts)(\/|$)/.test(new URL(request.url()).pathname))
      mainRequests.push(request.url())
  })
  await page.goto('/cv/en')
  await page.waitForLoadState('networkidle')
  expect(mainRequests).toEqual([])
})

test('the main portrait uses a local WebP and does not preload the CV application', async ({
  page,
}) => {
  const cvRequests: string[] = []
  page.on('request', (request) => {
    if (/^\/cv(\/|$)/.test(new URL(request.url()).pathname)) cvRequests.push(request.url())
  })
  await page.goto('/')
  const portrait = page.getByTestId('homepage-hero').getByRole('img', { name: 'Terry Chen 的照片' })
  await expect(portrait).toHaveAttribute('src', '/images/profile/avatar.webp')
  await page.waitForLoadState('networkidle')
  expect(cvRequests).toEqual([])
})

test('article images reserve space and use responsive WebP choices', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/posts/2026/ai-daily-2026-09-04')
  const images = page.locator('.prose img')
  await expect(images.first()).toHaveAttribute('width', '1672')
  await expect(images.first()).toHaveAttribute('height', '941')
  await expect(images.first()).toHaveAttribute('srcset', /768w, .*1440w/)
  await expect(images.nth(1)).toHaveAttribute('loading', 'lazy')
  await expect
    .poll(() => images.first().evaluate((image) => (image as HTMLImageElement).currentSrc))
    .toContain('/image-variants/')
})
