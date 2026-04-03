import { test as setup } from '@playwright/test'
import { mkdirSync } from 'fs'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers'

const authFile = 'tests/e2e/.auth/admin.json'

setup('authenticate as admin', async ({ page }) => {
  mkdirSync('tests/e2e/.auth', { recursive: true })
  await page.goto('/admin/login')
  await page.locator('#field-email').waitFor({ state: 'visible', timeout: 10000 })
  await page.locator('#field-email').fill(ADMIN_EMAIL)
  await page.locator('#field-password').fill(ADMIN_PASSWORD)
  await page.locator('button:has-text("Login")').click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })
  await page.context().storageState({ path: authFile })
})
