import { test, expect, type Page } from '@playwright/test'
import { readdir, readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'
import matter from 'gray-matter'

async function waitForScrollToSettle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) => {
      let previous = window.scrollY
      let stableFrames = 0
      const check = () => {
        const current = window.scrollY
        stableFrames = Math.abs(current - previous) < 0.5 ? stableFrames + 1 : 0
        previous = current
        if (stableFrames >= 15) resolve()
        else requestAnimationFrame(check)
      }
      requestAnimationFrame(check)
    })
  })
}

const cv = '/cv'
const email = 'mailto:zxtw17985321@gmail.com'

test.describe('Personal site', () => {
  test('[brand] introduces Terry before experiences, updates, work and contact', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '嗨，我是 Terry。', exact: true })).toBeVisible()
    expect(
      await page
        .locator('[data-home-section]')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-home-section')))
    ).toEqual(['intro', 'experiences', 'updates', 'work', 'contact'])
    await expect(
      page.getByTestId('experience-entries').getByRole('link', { name: '讀這段經歷' })
    ).toHaveCount(3)
    await expect(page.locator('main a[href="#"]')).toHaveCount(0)
  })

  test('[brand] provides factual sections for all three experience links', async ({ page }) => {
    for (const id of ['gj', 'nidin', 'ai-work']) {
      await page.goto('/')
      await page.locator(`a[href="/story#${id}"]`).first().click()
      await expect(page).toHaveURL(new RegExp(`/story#${id}$`))
      const section = page.locator(`[id="${id}"]`)
      await expect(section).toBeInViewport()
      expect(await section.locator('p').count()).toBeGreaterThanOrEqual(2)
      await expect(section.getByRole('link', { name: '看相關作品' })).toBeVisible()
    }
  })

  test('[brand] keeps CV and email available in the main navigation', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: '主要導覽' })
    for (const [name, href] of [
      ['關於我', '/about'],
      ['故事', '/story'],
      ['作品', '/work'],
      ['文章', '/posts'],
      ['CV', cv],
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    await expect(page.getByRole('banner').getByRole('link', { name: '聯絡' })).toHaveAttribute(
      'href',
      email
    )
    await page.getByRole('link', { name: 'Terry.TY Chen', exact: true }).click()
    await expect(page).toHaveURL('/')
  })

  test('mobile navigation opens by keyboard and closes on Escape and navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto('/')
    const menu = page.getByRole('button', { name: '導覽選單' })
    const nav = page.getByRole('navigation', { name: '手機導覽', includeHidden: true })
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
      if (await menu.evaluate((el) => el === document.activeElement)) break
    }
    await expect(menu).toBeFocused()
    await expect(menu).toHaveCSS('outline-style', 'solid')
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(nav).toBeVisible()
    for (const [name, href] of [
      ['關於我', '/about'],
      ['故事', '/story'],
      ['作品', '/work'],
      ['文章', '/posts'],
      ['CV', cv],
      ['聯絡', email],
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible()
      await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    await page.keyboard.press('Tab')
    await expect(nav.getByRole('link', { name: '關於我', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    await expect(menu).toBeFocused()
    await page.keyboard.press('Enter')
    await nav.getByRole('link', { name: '關於我', exact: true }).click()
    await expect(page).toHaveURL('/about')
    await expect(
      nav.getByRole('link', { name: '關於我', exact: true, includeHidden: true })
    ).toHaveAttribute('aria-current', 'page')
    await expect(
      nav.getByRole('link', { name: '聯絡', exact: true, includeHidden: true })
    ).not.toHaveAttribute('aria-current')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    await expect(menu).toBeFocused()
  })

  test('work gallery preserves source charts and public reading without login', async ({
    page,
  }) => {
    await page.goto('/work')
    await expect(page.locator('.work-showcase-card')).toHaveCount(5)
    await expect(page.locator('.work-showcase-card img')).toHaveCount(5)
    await expect(page.getByText('體驗需登入 ChatGPT。')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle theme', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const chart = page.locator('.codex-chart')
    const views = []
    for (const mode of ['每日', '每週', '累計']) {
      const control = page.getByRole('button', { name: mode, exact: true })
      await control.focus()
      await page.keyboard.press('Enter')
      await expect(control).toHaveAttribute('aria-pressed', 'true')
      views.push(
        await chart
          .locator('[data-activity-level]')
          .evaluateAll((cells) =>
            cells.map((cell) => cell.getAttribute('data-activity-level')).join('')
          )
      )
    }
    expect(new Set(views).size).toBe(3)
    await page.setViewportSize({ width: 375, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true)
    await expect(page.getByRole('region', { name: 'Token 活動圖，可水平捲動' })).toHaveAttribute(
      'tabindex',
      '0'
    )
    for (const locale of ['zh-TW', 'en']) {
      await page.goto(`/cv/${locale}#codex-profile`)
      const cvChart = page.locator('#cv-codex-activity')
      for (const name of locale === 'en'
        ? ['Daily', 'Weekly', 'Cumulative']
        : ['每日', '每週', '累計']) {
        const view = cvChart.getByRole('button', { name, exact: true })
        await view.click()
        await expect(view).toHaveAttribute('aria-pressed', 'true')
        await expect(cvChart.locator('.codex-chart')).toBeVisible()
        await expect(cvChart.locator('[data-activity-level]')).toHaveCount(364)
        await expect(cvChart.locator('[data-activity-level="0"]')).toHaveCount(0)
        const colors = await cvChart
          .locator('[data-activity-level]')
          .evaluateAll((cells) => [
            ...new Set(cells.map((cell) => getComputedStyle(cell).backgroundColor)),
          ])
        expect(colors).toHaveLength(4)
        expect(
          colors.every((color) =>
            [
              'rgb(109, 46, 16)',
              'rgb(185, 72, 14)',
              'rgb(252, 106, 33)',
              'rgb(255, 158, 108)',
            ].includes(color)
          )
        ).toBe(true)
        expect(
          await cvChart
            .locator('[data-activity-month]')
            .evaluateAll(
              (cells) => new Set(cells.map((cell) => cell.getAttribute('data-activity-month'))).size
            )
        ).toBe(12)
      }
      expect(
        await page
          .locator('[id]')
          .evaluateAll((nodes) =>
            nodes
              .map((node) => node.id)
              .filter((id) => id === 'activity-summary' || id === 'cv-activity-summary')
          )
      ).toEqual(['cv-activity-summary'])

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true)
    }
  })

  test('[brand] publishes only the selected work cases and returns 404 for others', async ({
    page,
  }) => {
    await page.goto('/work')
    for (const slug of ['gj', 'nidin', 'jurislm']) {
      const response = await page.goto(`/work/${slug}`)
      expect(response?.status()).toBe(200)
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page.locator(`main a[href="${cv}"]`)).toBeVisible()
      await page.goto('/work')
    }
    const missing = await page.goto('/work/not-a-case')
    expect(missing?.status()).toBe(404)
  })

  test('[brand] About introduces the site and keeps real public contacts', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: '關於我', exact: true })).toBeVisible()
    for (const href of [
      'https://github.com/terry90918',
      'https://x.com/zxtw17985321',
      'https://www.linkedin.com/in/tien-yi-chen-98812812a',
      email,
    ]) {
      await expect(page.getByTestId('about-connect').locator(`a[href="${href}"]`)).toBeVisible()
    }
  })

  test('theme toggle is keyboard reachable, has visible focus and changes the theme', async ({
    page,
  }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Toggle theme' })
    const before = await page.locator('html').getAttribute('data-theme')
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
      if (await toggle.evaluate((el) => el === document.activeElement)) break
    }
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveCSS('outline-style', 'solid')
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '')
  })

  for (const width of [320, 375, 1046]) {
    test(`[brand] remains readable and navigable at ${width}px in both themes`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ['/', '/about', '/story', '/work']) {
        await page.goto(path)
        for (let theme = 0; theme < 2; theme++) {
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
            )
          ).toBe(true)
          if (width <= 700) {
            await expect(page.getByRole('button', { name: '導覽選單' })).toBeVisible()
            await expect(page.getByRole('banner').locator('.site-header-contact')).toBeHidden()
            await expect(page.getByRole('navigation', { name: '主要導覽' })).toBeHidden()
          } else {
            await expect(
              page
                .getByRole('navigation', { name: '主要導覽' })
                .getByRole('link', { name: 'CV', exact: true })
            ).toBeVisible()
          }
          await page.getByRole('button', { name: 'Toggle theme' }).click()
        }
      }
    })
  }

  test('[brand] story anchors clear the sticky navigation on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto('/story#nidin')
    await waitForScrollToSettle(page)
    const section = await page.locator('#nidin').boundingBox()
    const header = await page.getByRole('banner').boundingBox()
    expect(section?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
  })

  test('footer preserves social links and license', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toContainText('CC BY 4.0 · Code MIT')
    for (const [name, href] of [
      ['GitHub', 'https://github.com/terry90918'],
      ['X (Twitter)', 'https://x.com/zxtw17985321'],
      ['LinkedIn', 'https://www.linkedin.com/in/tien-yi-chen-98812812a'],
      ['CV', cv],
      ['聯絡', email],
    ]) {
      await expect(footer.getByRole('link', { name, exact: true })).toBeVisible()
      await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
  })

  test('[brand] Nidin related work clears the sticky header after cross-page navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto('/story#nidin')
    await page.locator('#nidin').getByRole('link', { name: '看相關作品' }).click()
    await expect(page).toHaveURL('/work/nidin')
    await waitForScrollToSettle(page)
    const target = await page.locator('main h1').boundingBox()
    const header = await page.getByRole('banner').boundingBox()
    expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
    expect(target?.y).toBeLessThan(page.viewportSize()?.height ?? 0)
  })
})

test.describe('Post detail pages', () => {
  for (const width of [320, 375]) {
    test(`[mobile visual] new Harness articles fit the viewport at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of [
        '/posts/2026/openai-harness-engineering-beginner-guide',
        '/posts/2026/designing-harness-for-codex-app',
      ]) {
        await page.goto(path)
        const article = page.locator('main article')
        await expect(article.getByRole('heading', { level: 1 })).toBeVisible()
        await expect(article.locator('.typeset h2').first()).toBeVisible()
        await expect(article.locator('.typeset > div > p').first()).toBeVisible()
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
          )
        ).toBe(true)
        for (const locator of [article, article.getByRole('heading', { level: 1 })]) {
          const box = await locator.boundingBox()
          expect(box).not.toBeNull()
          expect(box!.x).toBeGreaterThanOrEqual(0)
          expect(box!.x + box!.width).toBeLessThanOrEqual(width)
        }
      }
    })
  }

  for (const width of [320, 1046]) {
    test(`[anchors] settled article hashes and heading links clear the header at ${width}px`, async ({
      page,
    }) => {
      const path = '/posts/2026/ai-daily-2026-08-28'
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      const heading = page.locator('.typeset h2[id]').nth(2)
      const id = await heading.getAttribute('id')
      expect(id).toBeTruthy()
      await page.goto(`${path}#${encodeURIComponent(id!)}`)
      await waitForScrollToSettle(page)
      let target = await heading.boundingBox()
      let header = await page.getByRole('banner').boundingBox()
      expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))

      await page.goto('/posts')
      await page.locator(`main a[href="${path}"]`).click()
      await expect(page).toHaveURL(path)
      await heading.locator('a').click()
      await waitForScrollToSettle(page)
      target = await heading.boundingBox()
      header = await page.getByRole('banner').boundingBox()
      expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
    })
  }

  for (const { slug, rendering } of [
    { slug: 'ai-daily-2026-08-28', rendering: 'blockquote' },
    { slug: 'ai-daily-2026-07-06', rendering: 'standalone' },
  ]) {
    test(`${slug} renders its excerpt exactly once as ${rendering}`, async ({ page }) => {
      const { data } = matter(
        await readFile(join(process.cwd(), `content/posts/2026/${slug}.md`), 'utf8')
      )
      expect(data.excerpt).toEqual(expect.any(String))
      await page.goto(`/posts/2026/${slug}`)
      const excerpt = page.getByText(data.excerpt, { exact: true })
      await expect(excerpt).toHaveCount(1)
      if (rendering === 'blockquote') {
        await expect(page.locator('article .typeset blockquote').first()).toHaveText(data.excerpt)
      } else {
        await expect(page.locator('article .typeset > p')).toHaveText(data.excerpt)
        await expect(page.locator('article .typeset blockquote').first()).not.toHaveText(
          data.excerpt
        )
      }
    })
  }
})

test('serves published article links in the RSS feed', async ({ request }) => {
  const response = await request.get('/rss.xml')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')
  const xml = await response.text()
  expect(xml).toContain('<channel>')
  expect(xml).toContain(`https://terry90918.github.io${(await sourceArticleURLs())[0]}`)
})

async function sourceArticleURLs() {
  const root = join(process.cwd(), 'content/posts')
  const paths: string[] = []
  for (const year of await readdir(root, { withFileTypes: true })) {
    if (!year.isDirectory()) continue
    for (const file of await readdir(join(root, year.name))) {
      if (!file.endsWith('.md')) continue
      const { data } = matter(await readFile(join(root, year.name, file), 'utf8'))
      if (data.status !== 'published') continue
      paths.push(
        `/posts/${new Date(data.publishedAt).getUTCFullYear()}/${data.slug ?? basename(file, '.md')}`
      )
    }
  }
  return paths.sort()
}

test.describe('Writing and metadata', () => {
  test('[writing] retains every published article URL, excluding drafts', async ({ page }) => {
    await page.goto('/posts')
    const hrefs = await page
      .locator('main [data-writing-kind]')
      .filter({ hasNotText: '草稿（開發預覽）' })
      .locator('a[href^="/posts/20"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).sort())
    expect(hrefs).toEqual(await sourceArticleURLs())
  })

  test('[writing] indexes all daily articles at their original URLs', async ({ page }) => {
    await page.goto('/posts/ai-daily')
    await expect(page.getByRole('heading', { name: 'AI 日報', exact: true })).toBeVisible()
    const hrefs = await page
      .locator('main a[href^="/posts/20"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).sort())
    expect(hrefs).toEqual((await sourceArticleURLs()).filter((url) => url.includes('/ai-daily-')))
    await expect(page.locator('[data-writing-kind="translation"]')).toHaveCount(0)
  })

  test('[writing] exposes the published AI, pstack and Harness series', async ({ page }) => {
    await page.goto('/posts')
    const nav = page.getByRole('navigation', { name: '文章主題' })
    await expect(nav.getByRole('link')).toHaveText(['AI 日報', 'pstack', 'Harness²'])
    await expect(nav.getByRole('link', { name: 'pstack', exact: true })).toHaveAttribute(
      'href',
      '/posts/pstack'
    )
    await expect(nav.getByRole('link', { name: 'Harness²', exact: true })).toHaveAttribute(
      'href',
      '/posts/harness2'
    )
    await expect(nav.getByRole('link', { name: 'AI 日報', exact: true })).toHaveAttribute(
      'href',
      '/posts/ai-daily'
    )
    await nav.getByRole('link', { name: 'AI 日報', exact: true }).click()
    await expect(page).toHaveURL('/posts/ai-daily')
    await expect(page.getByRole('heading', { name: 'AI 日報', exact: true })).toBeVisible()
  })

  test('[writing] gives new pages public canonical URLs and page-specific metadata', async ({
    page,
  }) => {
    for (const path of [
      '/',
      '/about',
      '/story',
      '/work',
      '/work/gj',
      '/work/nidin',
      '/work/jurislm',
      '/posts',
      '/posts/ai-daily',
    ]) {
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW')
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://terry90918.github.io${path === '/' ? '' : path}`
      )
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'zh_TW')
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy()
      expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBeTruthy()
      await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute(
        'content',
        '@zxtw17985321'
      )
      if (path === '/') await expect(page).toHaveTitle('Terry Chen')
    }
  })

  test('[writing] sitemap retains source article URLs and adds only real public routes', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const xml = await response.text()
    for (const path of [
      ...(await sourceArticleURLs()),
      '/story',
      '/work',
      '/work/gj',
      '/work/nidin',
      '/work/jurislm',
      '/posts/ai-daily',
    ]) {
      expect(xml).toContain(`https://terry90918.github.io${path}`)
    }
  })
})

test('[writing] gives an existing article its own canonical and social title', async ({
  request,
}) => {
  const path = '/posts/2026/ai-engineering-skills-map-software-engineering-fundamentals'
  const response = await request.get(path)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]).toBe(
    `https://terry90918.github.io${path}`
  )
  expect(html.match(/<meta[^>]*name="twitter:creator"[^>]*content="([^"]+)"/)?.[1]).toBe(
    '@zxtw17985321'
  )
  expect(html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/)?.[1]).toBe(
    'AI 工程技能地圖：軟體工程基礎'
  )
})
