import { test, expect } from '@playwright/test'

test.describe('J. 前端 — 導覽與互動', () => {
  test.describe('J1. Navigation Scroll 效果', () => {
    test('向下滾動後導覽列出現背景', async ({ page }) => {
      await page.goto('/')
      const nav = page.locator('nav')
      // Initially no shadow
      const initialClasses = await nav.getAttribute('class')
      expect(initialClasses).not.toContain('shadow')

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(500)

      const scrolledClasses = await nav.getAttribute('class')
      expect(scrolledClasses).toContain('shadow')
    })
  })

  test.describe('J2. 錨點導覽', () => {
    test('點擊聯絡我們平滑滾動到 #contact', async ({ page }) => {
      await page.goto('/')
      // Wait for lazy-loaded Contact component
      await page.waitForSelector('#contact', { timeout: 10000 })
      const contactLink = page.locator('nav a[href="#contact"]')
      await contactLink.click()
      await page.waitForTimeout(2000)
      // Contact section should be in viewport
      const contactSection = page.locator('#contact')
      await expect(contactSection).toBeInViewport()
    })
  })

  test.describe('J3. 頁面間導覽', () => {
    test('首頁 → 文章列表 → 文章詳情 → 返回（完整導覽流程）', async ({ page }) => {
      // 1. Start at homepage
      await page.goto('/')
      await expect(page).toHaveURL('/')

      // 2. Navigate to articles
      await page.click('nav a[href="/articles"]')
      await expect(page).toHaveURL('/articles', { timeout: 15000 })

      // 3. Click first article
      const articleLink = page.locator('a[href^="/articles/"]:not([href="/articles"])').first()
      const count = await articleLink.count()
      if (count > 0) {
        await articleLink.click()
        await expect(page).toHaveURL(/\/articles\/[\w-]+/, { timeout: 15000 })

        // 4. Go back to articles list
        const backLink = page.locator('a[href="/articles"]:has-text("返回文章列表")')
        await Promise.all([page.waitForURL('/articles', { timeout: 20000 }), backLink.click()])
      }
    })
  })

  test.describe('J4. 外部連結', () => {
    test('LINE 連結在新視窗開啟（target=_blank）', async ({ page }) => {
      await page.goto('/')
      const lineLinks = page.locator('a[href="https://lin.ee/nicHsmR"]')
      const count = await lineLinks.count()
      for (let i = 0; i < count; i++) {
        await expect(lineLinks.nth(i)).toHaveAttribute('target', '_blank')
      }
    })

    test('仁大法律事務所連結在新視窗開啟', async ({ page }) => {
      await page.goto('/')
      const zendaLinks = page.locator('a[href="https://zenda-law.com/"]')
      const count = await zendaLinks.count()
      for (let i = 0; i < count; i++) {
        await expect(zendaLinks.nth(i)).toHaveAttribute('target', '_blank')
      }
    })
  })

  test.describe('J5. 圖片載入', () => {
    test('Hero 圖片載入完成', async ({ page }) => {
      await page.goto('/')
      const heroImage = page.locator('img[alt="劉尹惠律師"]')
      await expect(heroImage).toBeVisible()
      // Check image actually loaded (naturalWidth > 0)
      const loaded = await heroImage.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
      )
      expect(loaded).toBeTruthy()
    })

    test('無破損圖片', async ({ page }) => {
      await page.goto('/')
      const images = page.locator('img')
      const count = await images.count()
      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        if (await img.isVisible()) {
          const loaded = await img.evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
          )
          const src = await img.getAttribute('src')
          expect(loaded, `Image broken: ${src}`).toBeTruthy()
        }
      }
    })
  })

  test.describe('J8. 響應式設計', () => {
    test('桌面版（1280px）：3 欄文章', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/articles')
      const grid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')
      // On large screens should use 3 columns via CSS grid
      if (await grid.isVisible()) {
        const gridStyle = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
        // Should have 3 column tracks
        const columns = gridStyle.split(' ').filter((s) => s !== '')
        expect(columns.length).toBe(3)
      }
    })

    test('手機版（375px）：1 欄文章', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/articles')
      const grid = page.locator('.grid.grid-cols-1')
      if (await grid.isVisible()) {
        const gridStyle = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
        const columns = gridStyle.split(' ').filter((s) => s !== '')
        expect(columns.length).toBe(1)
      }
    })
  })
})

test.describe('K. 前端 — 深色模式', () => {
  test('ThemeToggle 按鈕可見', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const themeToggle = page.locator('button[aria-label="切換主題"]')
    await expect(themeToggle).toBeVisible({ timeout: 10000 })
  })

  test('點擊 ThemeToggle 切換到深色模式', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const themeToggle = page.locator('button[aria-label="切換主題"]')
    await expect(themeToggle).toBeVisible({ timeout: 10000 })
    await themeToggle.click()
    await page.waitForTimeout(500)
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })

  test('再次點擊切換回淺色模式', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const themeToggle = page.locator('button[aria-label="切換主題"]')
    await expect(themeToggle).toBeVisible({ timeout: 10000 })
    // First click: to dark
    await themeToggle.click()
    await page.waitForTimeout(500)
    // Second click: back to light
    await themeToggle.click()
    await page.waitForTimeout(500)
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).not.toContain('dark')
  })
})

test.describe('L. SEO & API', () => {
  test.describe('L1. Sitemap', () => {
    test('訪問 /sitemap.xml 返回有效 XML', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      expect(response?.status()).toBe(200)
      const contentType = response?.headers()['content-type']
      expect(contentType).toContain('xml')
      const text = await page.textContent('body')
      expect(text).toContain('urlset')
    })
  })

  test.describe('L2. Robots.txt', () => {
    test('訪問 /robots.txt 返回有效內容', async ({ page }) => {
      const response = await page.goto('/robots.txt')
      expect(response?.status()).toBe(200)
      const text = await page.textContent('body')
      expect(text?.toLowerCase()).toContain('user-agent')
    })
  })

  test.describe('L3. OG Image API', () => {
    test('訪問 /api/og?title=Test 返回有效圖片', async ({ page }) => {
      const response = await page.goto('/api/og?title=Test')
      expect(response?.status()).toBe(200)
      const contentType = response?.headers()['content-type']
      expect(contentType).toContain('image')
    })
  })

  test.describe('L4. Payload REST API', () => {
    test('GET /api/articles 返回 JSON', async ({ request }) => {
      const response = await request.get('/api/articles')
      expect(response.status()).toBe(200)
      const json = await response.json()
      expect(json).toHaveProperty('docs')
    })

    test('GET /api/tags 返回 JSON', async ({ request }) => {
      const response = await request.get('/api/tags')
      expect(response.status()).toBe(200)
      const json = await response.json()
      expect(json).toHaveProperty('docs')
    })
  })

  test.describe('L5. 頁面 Metadata', () => {
    test('首頁 title 包含劉尹惠律師', async ({ page }) => {
      await page.goto('/')
      const title = await page.title()
      expect(title).toContain('劉尹惠律師')
    })

    test('首頁 OG 標籤正確設定', async ({ page }) => {
      await page.goto('/')
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toContain('劉尹惠')
      const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
      expect(ogDesc?.length).toBeGreaterThan(0)
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
      expect(ogUrl).toContain('lawyer.jurislm.com')
    })

    test('文章頁 title 包含文章標題', async ({ page }) => {
      // First get a slug
      await page.goto('/articles')
      const firstLink = page.locator('a[href^="/articles/"]:not([href="/articles"])').first()
      const count = await firstLink.count()
      if (count > 0) {
        const href = await firstLink.getAttribute('href')
        await page.goto(href!)
        const title = await page.title()
        expect(title).toContain('劉尹惠律師事務所')
        // Should also contain the article title
        const h1Text = await page.locator('h1').textContent()
        if (h1Text) {
          expect(title).toContain(h1Text)
        }
      }
    })
  })
})
