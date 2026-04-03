import { test, expect } from '@playwright/test'

test.describe('D. Payload Admin — Tags CRUD', () => {
  test.describe('D1. 標籤列表', () => {
    test('顯示標籤列表', async ({ page }) => {
      await page.goto('/admin/collections/tags')
      const tagLink = page
        .locator('a[href*="/admin/collections/tags/"]:not([href*="create"])')
        .first()
      await expect(tagLink).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('D2. 建立標籤', () => {
    test('Create 頁面有 Name 和 Slug 欄位', async ({ page }) => {
      await page.goto('/admin/collections/tags/create')
      await expect(page.locator('#field-name')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('#field-slug')).toBeVisible()
    })
  })
})

test.describe('E. Payload Admin — Media 管理', () => {
  test.describe('E1. 媒體列表', () => {
    test('顯示媒體列表頁面', async ({ page }) => {
      await page.goto('/admin/collections/media')
      await expect(page).toHaveURL(/\/admin\/collections\/media/)
    })
  })

  test.describe('E2. 上傳功能', () => {
    test('Create New 頁面有上傳區域', async ({ page }) => {
      await page.goto('/admin/collections/media/create')
      const uploadArea = page.locator(
        'input[type="file"], [class*="upload"], [class*="Upload"], [class*="dropzone"]'
      )
      await expect(uploadArea.first()).toBeVisible({ timeout: 15000 })
    })
  })
})

test.describe('F. Payload Admin — Users 管理', () => {
  test.describe('F1. 用戶列表', () => {
    test('顯示用戶列表（至少 1 個使用者）', async ({ page }) => {
      await page.goto('/admin/collections/users')
      const userLink = page
        .locator('a[href*="/admin/collections/users/"]:not([href*="create"])')
        .first()
      await expect(userLink).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('F2. 用戶資訊', () => {
    test('點擊用戶顯示 email 資訊', async ({ page }) => {
      await page.goto('/admin/collections/users')
      const firstUser = page
        .locator('a[href*="/admin/collections/users/"]:not([href*="create"])')
        .first()
      await firstUser.waitFor({ state: 'visible', timeout: 15000 })
      await firstUser.click()
      await page.waitForURL(/\/admin\/collections\/users\/\d+/, { timeout: 15000 })
      const emailField = page.locator('#field-email')
      await expect(emailField).toBeVisible({ timeout: 10000 })
      const emailValue = await emailField.inputValue()
      expect(emailValue).toContain('@')
    })
  })
})
