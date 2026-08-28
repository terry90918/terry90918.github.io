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

  test('renders the site header with Terry.TY Chen link', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
    const identityLink = header.getByRole('link', { name: 'Terry.TY Chen', exact: true })
    await expect(identityLink).toBeVisible()
    await expect(identityLink).toHaveText('Terry.TY Chen')
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

  test('theme toggle is keyboard reachable with a visible focus ring', async ({ page }) => {
    const html = page.locator('html')
    const toggleBtn = page.locator('[aria-label="Toggle theme"]')
    const initialTheme = await html.getAttribute('data-theme')

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    await expect(toggleBtn).toBeFocused()
    const focusStyle = await toggleBtn.evaluate((element) => ({
      outlineStyle: getComputedStyle(element).outlineStyle,
      outlineWidth: getComputedStyle(element).outlineWidth,
    }))
    expect(focusStyle.outlineStyle).not.toBe('none')
    expect(focusStyle.outlineWidth).not.toBe('0px')

    await page.keyboard.press('Enter')
    await expect(html).not.toHaveAttribute('data-theme', initialTheme ?? '')
  })

  test('shows hero section with avatar and name', async ({ page }) => {
    const hero = page.getByRole('heading', { name: "Hi, I'm Terry.TY Chen.", exact: true })
    await expect(hero).toBeVisible()
    await expect(hero).toHaveText("Hi, I'm Terry.TY Chen.")
  })

  test('aligns the header and homepage on the same editorial width', async ({ page }) => {
    await page.setViewportSize({ width: 1046, height: 1200 })

    const headerInner = page.getByTestId('header-inner')
    const homepageInner = page.getByTestId('homepage-inner')
    await expect(headerInner).toBeVisible()
    await expect(homepageInner).toBeVisible()
    const [headerBox, homepageBox] = await Promise.all([
      headerInner.boundingBox(),
      homepageInner.boundingBox(),
    ])

    expect(headerBox).not.toBeNull()
    expect(homepageBox).not.toBeNull()
    if (!headerBox || !homepageBox) return

    const centeredOffset = (box: { x: number; width: number }) =>
      Math.abs(box.x - (1046 - box.x - box.width))

    expect(Math.abs(headerBox.width - homepageBox.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(headerBox.width - 736)).toBeLessThanOrEqual(1)
    expect(centeredOffset(headerBox)).toBeLessThanOrEqual(1)
    expect(centeredOffset(homepageBox)).toBeLessThanOrEqual(1)
  })

  test('keeps the shared editorial width near the desktop breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 750, height: 1000 })

    const [headerBox, homepageBox] = await Promise.all([
      page.getByTestId('header-inner').boundingBox(),
      page.getByTestId('homepage-inner').boundingBox(),
    ])

    expect(headerBox).not.toBeNull()
    expect(homepageBox).not.toBeNull()
    if (!headerBox || !homepageBox) return

    expect(Math.abs(headerBox.width - homepageBox.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(headerBox.x - homepageBox.x)).toBeLessThanOrEqual(1)
  })

  test('uses an identity-first desktop hero', async ({ page }) => {
    await page.setViewportSize({ width: 1046, height: 1200 })

    const hero = page.getByTestId('homepage-hero')
    await expect(hero).toBeVisible()
    const portrait = hero.getByRole('img', { name: 'Terry Chen avatar' })
    const [heroStyle, portraitBox, headingStyle] = await Promise.all([
      hero.evaluate((element) => ({
        display: getComputedStyle(element).display,
        flexDirection: getComputedStyle(element).flexDirection,
        borderBottomWidth: getComputedStyle(element).borderBottomWidth,
      })),
      portrait.boundingBox(),
      hero
        .getByRole('heading', { name: "Hi, I'm Terry.TY Chen.", exact: true })
        .evaluate((element) => ({ fontSize: getComputedStyle(element).fontSize })),
    ])

    expect(heroStyle.display).toBe('flex')
    expect(heroStyle.flexDirection).toBe('row')
    expect(heroStyle.borderBottomWidth).toBe('1px')
    expect(portraitBox?.width).toBe(160)
    expect(portraitBox?.height).toBe(160)
    expect(headingStyle.fontSize).toBe('30px')
  })

  test('stacks the hero without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    const hero = page.getByTestId('homepage-hero')
    await expect(hero).toBeVisible()
    const heroStyle = await hero.evaluate((element) => ({
      flexDirection: getComputedStyle(element).flexDirection,
    }))
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )

    expect(heroStyle.flexDirection).toBe('column')
    expect(hasHorizontalOverflow).toBe(false)
  })

  test('presents recent posts as an open editorial list', async ({ page }) => {
    const postList = page.getByTestId('homepage-post-list')
    await expect(postList).toBeVisible()
    const postRows = postList.locator('article')

    await expect(page.getByRole('heading', { name: 'Latest Posts', exact: true })).toHaveCount(0)
    await expect(postRows).not.toHaveCount(0)

    const postBorders = await postRows.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element)
        return [
          style.borderTopWidth,
          style.borderRightWidth,
          style.borderBottomWidth,
          style.borderLeftWidth,
        ]
      })
    )
    expect(postBorders.flat()).toEqual(postBorders.flat().map(() => '0px'))
  })

  test('shows Terry-owned social and email links', async ({ page }) => {
    const main = page.locator('main')
    const githubLink = main.locator('a[href="https://github.com/terry90918"]')
    const xLink = main.locator('a[href="https://x.com/zxtw17985321"]')
    const linkedInLink = main.locator(
      'a[href="https://www.linkedin.com/in/tien-yi-chen-98812812a"]'
    )
    const emailLink = main.locator('a[href="mailto:zxtw17985321@gmail.com"]')
    await expect(githubLink).toBeVisible()
    await expect(xLink).toBeVisible()
    await expect(linkedInLink).toBeVisible()
    await expect(emailLink).toBeVisible()
    await expect(emailLink).toHaveText('Email')
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

// ---- Post detail pages ----
test.describe('Post detail pages', () => {
  for (const slug of [
    'ai-daily-2026-08-28',
    'ai-daily-2026-08-27',
    'ai-daily-2026-08-26',
    'ai-daily-2026-08-25',
    'ai-daily-2026-08-24',
    'ai-daily-2026-08-21',
    'ai-daily-2026-08-20',
  ]) {
    test(`${slug} renders its leading excerpt exactly once`, async ({ page }) => {
      await page.goto(`/posts/2026/${slug}`)

      await expect(page.locator('article .prose > p.not-prose')).toHaveCount(0)
      await expect(page.locator('article .prose blockquote').first()).not.toBeEmpty()
    })
  }

  test('keeps a standalone excerpt when the body does not begin with the same blockquote', async ({
    page,
  }) => {
    await page.goto('/posts/2026/ai-daily-2026-07-06')

    await expect(page.locator('article .prose > p.not-prose')).toHaveCount(1)
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

  test('shows the approved Traditional-Chinese professional narrative', async ({ page }) => {
    const profile = page.getByTestId('about-profile')
    await expect(
      profile.getByText('我在新竹地區打造能進入真實工作流程的 AI 系統。', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      profile.getByText(
        '從 AI agents、RAG 與 LLM 應用，到 agent harness 與產品工程，我專注把前沿模型能力轉化為企業可採用、可維運、可擴展的解決方案。',
        { exact: true }
      )
    ).toBeVisible()
    await expect(
      profile.getByText(
        '我持續開發對社會與產業有實際價值的 AI 應用工具，讓技術不只停在展示，而能成為推動工作方式與產業升級的基礎能力。',
        { exact: true }
      )
    ).toBeVisible()
  })

  test('shows GitHub contribution chart image', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'GitHub Activity', exact: true })).toBeVisible()
    const chartImg = page.getByRole('img', {
      name: "Terry Chen's GitHub contribution chart",
      exact: true,
    })
    await expect(chartImg).toBeVisible()
    await expect(
      page.locator(
        'img[src="https://ghchart.rshah.org/terry90918"][alt="Terry Chen\'s GitHub contribution chart"]'
      )
    ).toBeVisible()
  })

  test('has a GitHub profile link', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com/terry90918"]').first()
    await expect(githubLink).toBeVisible()
  })

  test('uses an editorial profile composition on desktop', async ({ page }) => {
    const profile = page.getByTestId('about-profile')
    await expect(profile).toBeVisible()
    const avatarWidth = await profile
      .locator('img[alt="Terry Chen avatar"]')
      .evaluate((element) => parseFloat(getComputedStyle(element).width))
    expect(avatarWidth).toBeGreaterThanOrEqual(144)
    await expect(profile).toHaveCSS('display', 'flex')
    await expect(profile).toHaveCSS('flex-direction', 'row')
  })

  test('stacks the profile without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const profile = page.getByTestId('about-profile')
    await expect(profile).toHaveCSS('display', 'flex')
    await expect(profile).toHaveCSS('flex-direction', 'column')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true)
  })

  test('shows four public contact links', async ({ page }) => {
    const connect = page.getByTestId('about-connect')
    await expect(connect).toBeVisible()
    await expect(connect.getByRole('link')).toHaveCount(4)

    for (const { name, href } of [
      { name: 'GitHub — github.com/terry90918', href: 'https://github.com/terry90918' },
      { name: 'X — @zxtw17985321', href: 'https://x.com/zxtw17985321' },
      {
        name: 'LinkedIn — Tien-Yi Chen',
        href: 'https://www.linkedin.com/in/tien-yi-chen-98812812a',
      },
      { name: 'Email — zxtw17985321@gmail.com', href: 'mailto:zxtw17985321@gmail.com' },
    ]) {
      const hrefLink = connect.locator(`a[href="${href}"]`)
      const namedLink = connect.getByRole('link', { name, exact: true })
      await expect(hrefLink).toHaveCount(1)
      await expect(hrefLink).toBeVisible()
      await expect(namedLink).toHaveCount(1)
      await expect(namedLink).toHaveAttribute('href', href)
      await expect(namedLink).toBeVisible()
    }
  })

  test('shows a visible 2px solid focus outline for every keyboard-reached Connect link', async ({
    page,
  }) => {
    const connect = page.getByTestId('about-connect')

    for (const { name, href } of [
      { name: 'GitHub — github.com/terry90918', href: 'https://github.com/terry90918' },
      { name: 'X — @zxtw17985321', href: 'https://x.com/zxtw17985321' },
      {
        name: 'LinkedIn — Tien-Yi Chen',
        href: 'https://www.linkedin.com/in/tien-yi-chen-98812812a',
      },
      { name: 'Email — zxtw17985321@gmail.com', href: 'mailto:zxtw17985321@gmail.com' },
    ]) {
      const link = connect.getByRole('link', { name, exact: true })

      for (let tabCount = 0; tabCount < 16; tabCount += 1) {
        await page.keyboard.press('Tab')
        if (await link.evaluate((element) => document.activeElement === element)) break
      }

      await expect(link).toBeFocused()
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveCSS('outline-style', 'solid')
      await expect(link).toHaveCSS('outline-width', '2px')
      expect(
        await link.evaluate((element) => {
          const channels = getComputedStyle(element)
            .outlineColor.match(/[\d.]+/g)
            ?.map(Number)
          return channels !== undefined && (channels.length < 4 || channels[3] > 0)
        })
      ).toBe(true)
    }
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
  test('Terry.TY Chen logo links to homepage', async ({ page }) => {
    await page.goto('/about')
    await page.getByRole('link', { name: 'Terry.TY Chen', exact: true }).click()
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
