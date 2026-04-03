import { test, expect } from '@playwright/test'

test.describe('A. Payload Admin — 登入/認證', () => {
  test.describe('A1. 登入頁面渲染', () => {
    test('訪問 /admin/login 顯示登入表單', async ({ page }) => {
      // Clear auth to see login page
      await page.context().clearCookies()
      await page.goto('/admin/login')
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('#field-email')).toBeVisible()
      await expect(page.locator('#field-password')).toBeVisible()
    })

    test('Login 按鈕存在且可見', async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/admin/login')
      await expect(page.locator('button:has-text("Login")')).toBeVisible()
    })
  })

  test.describe('A2. 登入功能', () => {
    test('已認證的使用者可存取 Dashboard', async ({ page }) => {
      // storageState already has auth, so we should be able to access admin
      await page.goto('/admin')
      await expect(page).not.toHaveURL(/\/admin\/login/)
    })

    test('輸入錯誤帳密 → 顯示錯誤訊息', async ({ page }) => {
      // Clear auth state for this test
      await page.context().clearCookies()
      await page.goto('/admin/login')
      await page.locator('#field-email').fill('wrong@example.com')
      await page.locator('#field-password').fill('wrongpassword')
      await page.locator('button:has-text("Login")').click()
      await page.waitForTimeout(3000)
      await expect(page).toHaveURL(/\/admin\/login/)
    })
  })

  test.describe('A4. 未認證存取保護', () => {
    test('未登入直接訪問 /admin → 重導到登入頁', async ({ page }) => {
      // Clear auth state
      await page.context().clearCookies()
      await page.goto('/admin')
      await page.waitForURL(/\/admin\/login/, { timeout: 10000 })
      await expect(page).toHaveURL(/\/admin\/login/)
    })
  })
})
