import { expect, test } from '@playwright/test'

test('the default Chinese CV highlights its current section', async ({ page }) => {
  await page.goto('/cv#about')
  await expect(
    page
      .getByRole('navigation', { name: '履歷章節', exact: true })
      .getByRole('link', { name: '關於我', exact: true })
  ).toHaveAttribute('aria-current', 'location')
})

test('CV opens inside the main site and shares its navigation and theme', async ({ page }) => {
  await page.goto('/')
  const cvLink = page
    .getByRole('navigation', { name: '主要導覽', exact: true })
    .getByRole('link', { name: 'CV', exact: true })
  await expect(cvLink).toHaveAttribute('href', '/cv')
  await cvLink.click()
  await expect(page).toHaveURL(/\/cv\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('陳天一')
  expect(
    await page
      .locator('#top .bg-accent')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor)
  ).toBe('lab(61.5867 61.0772 71.9669)')
  await expect(page.getByRole('banner')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Toggle theme', exact: true })).toHaveCount(1)
  await page.getByRole('button', { name: 'Toggle theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('link', { name: 'Terry.TY Chen', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('language switching stays on the corresponding case and chapter', async ({ page }) => {
  await page.goto('/cv/zh-TW/case-study/jurislm#我的角色')
  await page.getByRole('link', { name: 'Switch to English', exact: true }).click()
  await expect(page).toHaveURL(/\/cv\/en\/case-study\/jurislm#my-role$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('#my-role')).toBeInViewport()
  await page.getByRole('link', { name: '切換至繁體中文', exact: true }).click()
  await expect(page).toHaveURL(
    /\/cv\/zh-TW\/case-study\/jurislm#(%E6%88%91%E7%9A%84%E8%A7%92%E8%89%B2|我的角色)$/
  )
})

test('both locales export every case and contact without old asset prefixes', async ({
  request,
}) => {
  for (const locale of ['zh-TW', 'en']) {
    for (const route of [
      '',
      '/contact',
      ...['jurislm', 'nidin', 'vclass', 'gj', 'channel-t', 'backlight-memory'].map(
        (slug) => `/case-study/${slug}`
      ),
    ]) {
      const response = await request.get(`/cv/${locale}${route}`)
      expect(response.status()).toBe(200)
      const html = await response.text()
      expect(html).toContain(`lang="${locale}"`)
      expect(html).toContain(`href="https://terry90918.github.io/cv/${locale}${route}"`)
      expect(html).not.toContain('/cv/_next/')
      expect(html).not.toContain('http://localhost:3000')
    }
  }
  expect((await request.get('/cv/en/case-study/unknown')).status()).toBe(404)
  expect((await request.get('/cv/fr')).status()).toBe(404)
})

test('mobile CV keeps its sections readable and language links inside the site', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/cv/en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tien Yi Chen')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  )
  await page
    .getByRole('navigation', { name: 'CV sections', exact: true })
    .getByRole('link', { name: 'Experience', exact: true })
    .click()
  await expect(page.locator('#experience h2')).toBeInViewport()
  const header = await page.getByRole('banner').boundingBox()
  const section = await page.locator('#experience').boundingBox()
  expect(section!.y).toBeGreaterThanOrEqual(header!.y + header!.height)
  await page.keyboard.press('End')
  await expect
    .poll(async () => {
      const license = await page
        .getByRole('contentinfo')
        .getByText('CC BY 4.0 · Code MIT', { exact: true })
        .boundingBox()
      const dock = await page
        .getByRole('navigation', { name: 'CV sections', exact: true })
        .boundingBox()
      return license!.y + license!.height <= dock!.y
    })
    .toBe(true)
})

test('CV styles preserve the main-site link shape', async ({ page }) => {
  await page.goto('/')
  const brand = page.getByRole('link', { name: 'Terry.TY Chen', exact: true })
  expect(await brand.evaluate((element) => getComputedStyle(element).borderRadius)).toBe('4px')
})
