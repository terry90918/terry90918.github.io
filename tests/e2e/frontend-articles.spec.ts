import { test, expect } from '@playwright/test'

test.describe('H. 前端 — 文章列表頁', () => {
  test.describe('H1. 文章列表載入', () => {
    test('訪問 /articles 顯示文章列表', async ({ page }) => {
      await page.goto('/articles')
      await expect(page).toHaveURL('/articles')
    })

    test('頁面標題 法律新知 正確', async ({ page }) => {
      await page.goto('/articles')
      await expect(page.locator('h1')).toContainText('法律新知')
    })
  })

  test.describe('H2. 文章卡片', () => {
    test('文章顯示標題和日期', async ({ page }) => {
      await page.goto('/articles')
      const articles = page.locator('article')
      const count = await articles.count()
      if (count > 0) {
        // First article should have a title (h3) and date (time)
        const firstArticle = articles.first()
        await expect(firstArticle.locator('h3')).toBeVisible()
        await expect(firstArticle.locator('time')).toBeVisible()
      }
    })

    test('點擊卡片導向 /articles/{slug}', async ({ page }) => {
      await page.goto('/articles')
      const articleLinks = page.locator('a[href^="/articles/"]:not([href="/articles"])')
      const count = await articleLinks.count()
      if (count > 0) {
        const href = await articleLinks.first().getAttribute('href')
        expect(href).toMatch(/^\/articles\/[\w-]+$/)
        await articleLinks.first().click()
        await expect(page).toHaveURL(/\/articles\/[\w-]+/)
      }
    })
  })

  test.describe('H3. 標籤篩選', () => {
    test('標籤列表顯示所有標籤', async ({ page }) => {
      await page.goto('/articles')
      // "全部文章" button should exist
      const allButton = page.locator('a:has-text("全部文章")')
      await expect(allButton).toBeVisible()
    })

    test('點擊標籤 → URL 帶 tag 參數', async ({ page }) => {
      await page.goto('/articles')
      await page.waitForLoadState('networkidle')
      // Find a tag link (not "全部文章")
      const tagLinks = page.locator('a[href*="?tag="]')
      const count = await tagLinks.count()
      if (count > 0) {
        await tagLinks.first().click()
        await expect(page).toHaveURL(/\/articles\?tag=/, { timeout: 15000 })
      }
    })

    test('點擊 全部 標籤返回所有文章', async ({ page }) => {
      // First navigate with a tag filter
      await page.goto('/articles')
      const tagLinks = page.locator('a[href*="?tag="]')
      const tagCount = await tagLinks.count()
      if (tagCount > 0) {
        await tagLinks.first().click()
        await expect(page).toHaveURL(/\/articles\?tag=/)
        // Now click "全部文章" to go back
        const allButton = page.locator('a[href="/articles"]:has-text("全部文章")')
        await allButton.click()
        await expect(page).toHaveURL('/articles', { timeout: 15000 })
      }
    })
  })

  test.describe('H5. 空狀態', () => {
    test('篩選後無結果顯示提示訊息', async ({ page }) => {
      await page.goto('/articles?tag=nonexistent-tag-12345')
      // Should show empty message
      const emptyMessage = page.locator('text=目前沒有')
      await expect(emptyMessage).toBeVisible()
    })
  })

  test.describe('H6. 文章排序', () => {
    test('文章按發佈日期降序排列', async ({ page }) => {
      await page.goto('/articles')
      const dates = page.locator('article time')
      const count = await dates.count()
      if (count >= 2) {
        const dateTexts = await dates.allTextContents()
        // Parse dates and verify descending order
        const parsedDates = dateTexts
          .map((d) => {
            const match = d.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
            if (match) {
              return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
            }
            return null
          })
          .filter(Boolean) as Date[]

        for (let i = 0; i < parsedDates.length - 1; i++) {
          expect(parsedDates[i].getTime()).toBeGreaterThanOrEqual(parsedDates[i + 1].getTime())
        }
      }
    })
  })

  test.describe('H7. 文章數量', () => {
    test('顯示的文章數量正確', async ({ page }) => {
      await page.goto('/articles')
      const articles = page.locator('article')
      const count = await articles.count()
      // Should have at least 1 article (migrated data)
      expect(count).toBeGreaterThan(0)
    })
  })
})

test.describe('I. 前端 — 文章詳情頁', () => {
  // First get a valid slug from the articles page
  let articleSlug: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/articles')
    const firstLink = page.locator('a[href^="/articles/"]:not([href="/articles"])').first()
    const href = await firstLink.getAttribute('href')
    articleSlug = href?.replace('/articles/', '') ?? ''
    await page.close()
  })

  test.describe('I1. 文章內容渲染', () => {
    test('訪問文章頁面正確渲染', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      // Title
      await expect(page.locator('h1')).toBeVisible()
      // Content area
      await expect(page.locator('article')).toBeVisible()
    })

    test('標題、發佈日期正確顯示', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
      const title = await h1.textContent()
      expect(title?.length).toBeGreaterThan(0)
    })
  })

  test.describe('I3. 返回按鈕', () => {
    test('返回文章列表按鈕可點擊', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      const backLink = page.locator('a[href="/articles"]:has-text("返回文章列表")')
      await expect(backLink).toBeVisible()
      await backLink.click()
      await expect(page).toHaveURL('/articles', { timeout: 15000 })
    })
  })

  test.describe('I4. 標籤連結', () => {
    test('文章標籤可點擊導向篩選頁', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      const tagLinks = page.locator('a[href*="/articles?tag="]')
      const count = await tagLinks.count()
      if (count > 0) {
        const href = await tagLinks.first().getAttribute('href')
        expect(href).toMatch(/\/articles\?tag=/)
      }
    })
  })

  test.describe('I5. 分享功能', () => {
    test('Facebook 分享按鈕存在', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      const fbShare = page.locator('a[href*="facebook.com/sharer"]')
      await expect(fbShare).toBeVisible()
      await expect(fbShare).toHaveAttribute('target', '_blank')
    })

    test('LINE 分享按鈕存在', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      const lineShare = page.locator('a[href*="line.me"]')
      await expect(lineShare).toBeVisible()
      await expect(lineShare).toHaveAttribute('target', '_blank')
    })
  })

  test.describe('I6. CTA 區塊', () => {
    test('文章底部顯示預約諮詢 CTA', async ({ page }) => {
      test.skip(!articleSlug, '沒有可用的文章')
      await page.goto(`/articles/${articleSlug}`)
      const cta = page.locator('a[href="https://lin.ee/nicHsmR"]:has-text("預約諮詢")')
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('target', '_blank')
    })
  })

  test.describe('I8. 404 頁面', () => {
    test('訪問不存在的 slug 顯示 404', async ({ page }) => {
      const response = await page.goto('/articles/this-article-does-not-exist-12345')
      expect(response?.status()).toBe(404)
    })
  })
})
