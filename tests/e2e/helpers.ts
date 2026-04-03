import type { Page } from '@playwright/test'

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'e2e-test@jurislm.com'
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'E2ETest2026'

export async function adminLogin(page: Page) {
  await page.goto('/admin/login')
  const emailField = page.locator('#field-email')
  await emailField.waitFor({ state: 'visible', timeout: 10000 })
  await emailField.fill(ADMIN_EMAIL)
  const passwordField = page.locator('#field-password')
  await passwordField.fill(ADMIN_PASSWORD)
  await page.locator('button:has-text("Login")').click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })
}
