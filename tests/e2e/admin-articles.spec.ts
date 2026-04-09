import { test, expect } from '@playwright/test'

test.describe('C. Payload Admin — Posts CRUD', () => {
  test.describe('C1. 文章列表頁', () => {
    test('顯示文章列表（含文章連結）', async ({ page }) => {
      await page.goto('/admin/collections/posts')
      const postLink = page.locator('a[href*="/admin/collections/posts/"]').first()
      await expect(postLink).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('C2. 文章完整 CRUD 生命週期', () => {
    test('建立 → 驗證 Slug → 編輯 → 刪除', async ({ page }) => {
      const uniqueId = Date.now()
      const postTitle = `E2E CRUD Test ${uniqueId}`
      const updatedTitle = `E2E CRUD Updated ${uniqueId}`
      let postId: string | undefined

      try {
        // === CREATE ===
        await test.step('建立新文章', async () => {
          await page.goto('/admin/collections/posts/create')
          const titleField = page.locator('#field-title')
          await titleField.waitFor({ state: 'visible', timeout: 15000 })
          await titleField.fill(postTitle)

          const editor = page.locator('[contenteditable="true"]').first()
          await editor.click()
          await editor.fill('E2E 測試內容 — 此文章將在測試結束後自動刪除')

          await page.locator('button:has-text("Save"), button[id="action-save"]').first().click()
          await page.waitForURL(/\/admin\/collections\/posts\/(\d+)/, {
            timeout: 15000,
          })

          postId = page.url().match(/posts\/(\d+)/)?.[1]
          expect(postId).toBeTruthy()
        })

        // === VERIFY (slug auto-generation) ===
        await test.step('驗證 Slug 從 Title 自動生成', async () => {
          const slugValue = await page.locator('#field-slug').inputValue()
          expect(slugValue.length).toBeGreaterThan(0)
          expect(slugValue).toContain('e2e-crud-test')
        })

        // === UPDATE ===
        await test.step('編輯文章標題', async () => {
          const titleField = page.locator('#field-title')
          await titleField.clear()
          await titleField.fill(updatedTitle)

          await page.locator('button:has-text("Save"), button[id="action-save"]').first().click()

          await page.waitForTimeout(2000)

          const savedTitle = await page.locator('#field-title').inputValue()
          expect(savedTitle).toBe(updatedTitle)
        })

        // === DELETE ===
        await test.step('刪除文章', async () => {
          const response = await page.request.delete(`/api/posts/${postId}`)
          expect(response.ok()).toBeTruthy()
        })

        // === VERIFY DELETION ===
        await test.step('驗證文章已從列表移除', async () => {
          await page.goto('/admin/collections/posts')
          await page.waitForTimeout(2000)
          const content = await page.textContent('body')
          expect(content).not.toContain(updatedTitle)
        })
      } finally {
        if (postId) {
          try {
            await page.request.delete(`/api/posts/${postId}`)
          } catch {
            // Ignore — post may already be deleted
          }
        }
      }
    })
  })

  test.describe('C3. 編輯既有文章', () => {
    test('從列表點擊文章 → 開啟編輯頁', async ({ page }) => {
      await page.goto('/admin/collections/posts')
      const firstPost = page
        .locator('a[href*="/admin/collections/posts/"]:not([href*="create"])')
        .first()
      await firstPost.waitFor({ state: 'visible', timeout: 15000 })
      await firstPost.click()
      await page.waitForURL(/\/admin\/collections\/posts\/\d+/, {
        timeout: 15000,
      })
      const titleField = page.locator('#field-title')
      await expect(titleField).toBeVisible({ timeout: 10000 })
      const titleValue = await titleField.inputValue()
      expect(titleValue.length).toBeGreaterThan(0)
    })
  })

  test.describe('C4. Rich Text 編輯器（Lexical）', () => {
    test('Lexical 編輯器可見且可操作', async ({ page }) => {
      await page.goto('/admin/collections/posts/create')
      const editor = page.locator('[contenteditable="true"], [data-lexical-editor]')
      await expect(editor.first()).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('C5. 文章狀態', () => {
    test('Status 欄位存在', async ({ page }) => {
      await page.goto('/admin/collections/posts/create')
      const statusField = page.locator('#field-status, [name="status"]')
      await expect(statusField).toBeVisible({ timeout: 15000 })
    })
  })
})
