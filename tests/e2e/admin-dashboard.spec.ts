import { test, expect } from '@playwright/test'

test.describe('B. Payload Admin — Dashboard', () => {
  test.describe('B1. Dashboard 渲染', () => {
    test('登入後顯示 Dashboard 頁面', async ({ page }) => {
      await page.goto('/admin')
      await expect(page).not.toHaveURL(/\/admin\/login/)
    })

    test('顯示 Collection 卡片：Articles、Tags、Media、Users', async ({ page }) => {
      await page.goto('/admin')
      await page.waitForTimeout(2000)
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Articles')
      expect(pageContent).toContain('Tags')
      expect(pageContent).toContain('Media')
      expect(pageContent).toContain('Users')
    })
  })

  test.describe('B2. Collection 頁面可訪問', () => {
    test('Articles 列表頁可正常載入', async ({ page }) => {
      await page.goto('/admin/collections/articles')
      await expect(page).toHaveURL(/\/admin\/collections\/articles/)
      await expect(page.locator('body')).toContainText('Articles')
    })

    test('Tags 列表頁可正常載入', async ({ page }) => {
      await page.goto('/admin/collections/tags')
      await expect(page).toHaveURL(/\/admin\/collections\/tags/)
      await expect(page.locator('body')).toContainText('Tags')
    })

    test('Media 列表頁可正常載入', async ({ page }) => {
      await page.goto('/admin/collections/media')
      await expect(page).toHaveURL(/\/admin\/collections\/media/)
      await expect(page.locator('body')).toContainText('Media')
    })
  })

  test.describe('B3. 側邊欄導覽', () => {
    test('側邊欄顯示所有 Collection 連結', async ({ page }) => {
      await page.goto('/admin')
      await page.waitForTimeout(2000)
      const hrefs = await page
        .locator('a')
        .evaluateAll((els) => els.map((el) => el.getAttribute('href')).filter(Boolean))
      const collectionPaths = [
        '/admin/collections/articles',
        '/admin/collections/tags',
        '/admin/collections/media',
        '/admin/collections/users',
      ]
      for (const path of collectionPaths) {
        expect(hrefs.some((h) => h?.includes(path))).toBeTruthy()
      }
    })
  })
})
