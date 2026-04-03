/**
 * E2E tests for the steipete-style blog frontend
 *
 * TDD - RED phase: These tests define expected behavior BEFORE implementation.
 * Base URL: http://localhost:3001
 */

import { test, expect } from '@playwright/test'

// ---- Homepage ----
test.describe('Homepage (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the site header with Terry Chen link', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
    await expect(header.locator('a', { hasText: 'Terry Chen' })).toBeVisible()
  })

  test('header has Posts navigation link', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.locator('a', { hasText: 'Posts' })).toBeVisible()
  })

  test('header has About navigation link', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.locator('a', { hasText: 'About' })).toBeVisible()
  })

  test('header has a theme toggle button', async ({ page }) => {
    const toggleBtn = page.locator('[aria-label="Toggle theme"]')
    await expect(toggleBtn).toBeVisible()
  })

  test('theme toggle switches data-theme attribute', async ({ page }) => {
    const html = page.locator('html')
    const toggleBtn = page.locator('[aria-label="Toggle theme"]')
    const initialTheme = await html.getAttribute('data-theme')
    await toggleBtn.click()
    // Theme should have changed
    const newTheme = await html.getAttribute('data-theme')
    expect(newTheme).not.toBe(initialTheme)
  })

  test('shows hero section with avatar and name', async ({ page }) => {
    await expect(page.locator('h1', { hasText: "I'm @terry90918" })).toBeVisible()
  })

  test('shows GitHub social link', async ({ page }) => {
    const githubLink = page.locator('a[href="https://github.com/terry90918"]').first()
    await expect(githubLink).toBeVisible()
  })

  test('shows latest posts section with "All Posts" link', async ({ page }) => {
    const allPostsLink = page.locator('a', { hasText: 'All Posts' })
    await expect(allPostsLink).toBeVisible()
  })

  test('"All Posts" link navigates to /posts', async ({ page }) => {
    await page.locator('a', { hasText: 'All Posts' }).first().click()
    await expect(page).toHaveURL('/posts')
  })

  test('footer is visible with copyright text', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('CC BY 4.0')
  })
})

// ---- /posts page ----
test.describe('/posts listing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/posts')
  })

  test('renders the page heading "All Posts"', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'All Posts' })).toBeVisible()
  })

  test('page is accessible (has main landmark)', async ({ page }) => {
    await expect(page.locator('main, section').first()).toBeVisible()
  })
})

// ---- /about page ----
test.describe('/about page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
  })

  test('renders the page heading "About"', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'About' })).toBeVisible()
  })

  test('shows location text', async ({ page }) => {
    await expect(page.locator('text=Taipei')).toBeVisible()
  })

  test('shows GitHub contribution chart image', async ({ page }) => {
    const chartImg = page.locator('img[src*="ghchart.rshah.org"]')
    await expect(chartImg).toBeVisible()
  })

  test('has a GitHub profile link', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com/terry90918"]').first()
    await expect(githubLink).toBeVisible()
  })
})

// ---- /rss.xml route ----
test.describe('/rss.xml feed', () => {
  test('returns XML content', async ({ page }) => {
    const response = await page.goto('/rss.xml')
    expect(response?.status()).toBe(200)
    const contentType = response?.headers()['content-type'] ?? ''
    expect(contentType).toContain('xml')
  })

  test('RSS contains channel title', async ({ page }) => {
    const response = await page.goto('/rss.xml')
    const body = await response?.text()
    expect(body).toContain('<title>Terry Chen</title>')
  })
})

// ---- Navigation ----
test.describe('Navigation links', () => {
  test('Terry Chen logo links to homepage', async ({ page }) => {
    await page.goto('/about')
    await page.locator('header a', { hasText: 'Terry Chen' }).click()
    await expect(page).toHaveURL('/')
  })

  test('Posts nav link goes to /posts', async ({ page }) => {
    await page.goto('/')
    await page.locator('header a', { hasText: 'Posts' }).click()
    await expect(page).toHaveURL('/posts')
  })

  test('About nav link goes to /about', async ({ page }) => {
    await page.goto('/')
    await page.locator('header a', { hasText: 'About' }).click()
    await expect(page).toHaveURL('/about')
  })
})
