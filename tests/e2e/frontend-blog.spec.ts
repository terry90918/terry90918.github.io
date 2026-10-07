import { test, expect, type Page } from '@playwright/test'
import { readdir, readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'
import matter from 'gray-matter'

async function waitForScrollToSettle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) => {
      let previous = window.scrollY
      let stableFrames = 0
      const check = () => {
        const current = window.scrollY
        stableFrames = Math.abs(current - previous) < 0.5 ? stableFrames + 1 : 0
        previous = current
        if (stableFrames >= 15) resolve()
        else requestAnimationFrame(check)
      }
      requestAnimationFrame(check)
    })
  })
}

const cv = 'https://terry90918.github.io/cv/'
const email = 'mailto:zxtw17985321@gmail.com'

test.describe('Personal site', () => {
  test('[brand] introduces Terry before experiences, updates, work and contact', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '嗨，我是 Terry。', exact: true })).toBeVisible()
    expect(
      await page
        .locator('[data-home-section]')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-home-section')))
    ).toEqual(['intro', 'experiences', 'updates', 'work', 'contact'])
    await expect(page.getByTestId('experience-entries').getByRole('link')).toHaveCount(3)
    await expect(page.locator('main')).not.toContainText(/820 萬|1,500 萬|0\.957|敬請期待/)
    await expect(page.locator('main a[href="#"]')).toHaveCount(0)
  })

  test('[brand] provides factual sections for all three experience links', async ({ page }) => {
    for (const id of ['gj', 'nidin', 'ai-work']) {
      await page.goto('/')
      await page.locator(`a[href="/story#${id}"]`).click()
      await expect(page).toHaveURL(new RegExp(`/story#${id}$`))
      const section = page.locator(`[id="${id}"]`)
      await expect(section).toBeInViewport()
      expect(await section.locator('p').count()).toBeGreaterThanOrEqual(2)
      await expect(section.getByRole('link', { name: '看相關作品' })).toBeVisible()
    }
  })

  test('[brand] keeps CV and email available in the main navigation', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: '主要導覽' })
    for (const [name, href] of [
      ['關於我', '/about'],
      ['故事', '/story'],
      ['作品', '/work'],
      ['文章', '/posts'],
      ['CV', cv],
      ['聯絡', email],
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    await page.getByRole('link', { name: 'Terry.TY Chen', exact: true }).click()
    await expect(page).toHaveURL('/')
  })

  test('[brand] treats repeated daily posts as one update and credits the translation', async ({
    page,
  }) => {
    await page.goto('/')
    const updates = page.getByTestId('home-updates')
    await expect(updates.locator('[data-writing-kind="ai-daily"]')).toHaveCount(1)
    expect(await updates.locator('article').count()).toBeLessThanOrEqual(3)
    await expect(updates.locator('[data-writing-kind="translation"]')).toContainText('Andrew Ng')
  })

  test('[brand] publishes only the selected work cases and returns 404 for others', async ({
    page,
  }) => {
    await page.goto('/work')
    for (const slug of ['gj', 'nidin', 'jurislm']) {
      await expect(page.locator(`main a[href="/work/${slug}"]`)).toBeVisible()
      const response = await page.goto(`/work/${slug}`)
      expect(response?.status()).toBe(200)
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page.locator(`main a[href="${cv}"]`)).toBeVisible()
      await page.goto('/work')
    }
    const missing = await page.goto('/work/not-a-case')
    expect(missing?.status()).toBe(404)
  })

  test('[brand] About introduces the site and keeps real public contacts', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: '嗨，我是 Terry。', exact: true })).toBeVisible()
    await expect(page.getByTestId('about-profile')).toContainText(
      '我做軟體產品、規劃系統架構，也帶工程團隊'
    )
    await expect(page.locator('main')).not.toContainText(/敬請期待|熱愛旅行|人生使命/)
    for (const href of [
      'https://github.com/terry90918',
      'https://x.com/zxtw17985321',
      'https://www.linkedin.com/in/tien-yi-chen-98812812a',
      email,
    ]) {
      await expect(page.locator(`main a[href="${href}"]`)).toBeVisible()
    }
  })

  test('theme toggle is keyboard reachable, has visible focus and changes the theme', async ({
    page,
  }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Toggle theme' })
    const before = await page.locator('html').getAttribute('data-theme')
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
      if (await toggle.evaluate((el) => el === document.activeElement)) break
    }
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveCSS('outline-style', 'solid')
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '')
  })

  for (const width of [320, 375, 1046]) {
    test(`[brand] remains readable and navigable at ${width}px in both themes`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ['/', '/about', '/story', '/work']) {
        await page.goto(path)
        for (let theme = 0; theme < 2; theme++) {
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
            )
          ).toBe(true)
          await expect(
            page
              .getByRole('navigation', { name: '主要導覽' })
              .getByRole('link', { name: 'CV', exact: true })
          ).toBeVisible()
          await page.getByRole('button', { name: 'Toggle theme' }).click()
        }
      }
    })
  }

  test('[brand] story anchors clear the sticky navigation on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto('/story#nidin')
    await waitForScrollToSettle(page)
    const section = await page.locator('#nidin').boundingBox()
    const header = await page.getByRole('banner').boundingBox()
    expect(section?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
  })

  test('footer preserves social links and license', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toContainText('CC BY 4.0')
    await expect(
      page.locator('footer').getByRole('link', { name: 'GitHub', exact: true })
    ).toBeVisible()
  })

  test('[brand] TPI related work clears the sticky header after cross-page navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto('/story#tpi')
    await page.locator('#tpi').getByRole('link', { name: '看相關作品' }).click()
    await expect(page).toHaveURL('/work#tpi')
    await waitForScrollToSettle(page)
    const target = await page.locator('#tpi').boundingBox()
    const header = await page.getByRole('banner').boundingBox()
    expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
  })
})

// ---- Post detail pages ----
test.describe('Post detail pages', () => {
  for (const width of [320, 1046]) {
    test(`[anchors] settled article hashes and heading links clear the header at ${width}px`, async ({
      page,
    }) => {
      const path = '/posts/2026/ai-daily-2026-08-28'
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      const heading = page.locator('.prose h2[id]').nth(2)
      const id = await heading.getAttribute('id')
      expect(id).toBeTruthy()
      await page.goto(`${path}#${encodeURIComponent(id!)}`)
      await waitForScrollToSettle(page)
      let target = await heading.boundingBox()
      let header = await page.getByRole('banner').boundingBox()
      expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))

      await page.goto('/posts')
      await page.locator(`main a[href="${path}"]`).click()
      await expect(page).toHaveURL(path)
      await heading.locator('a').click()
      await waitForScrollToSettle(page)
      target = await heading.boundingBox()
      header = await page.getByRole('banner').boundingBox()
      expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
    })
  }

  for (const { slug, excerpt } of [
    {
      slug: 'ai-daily-2026-08-28',
      excerpt:
        'NVIDIA 收購 Hugging Face 的報導尚待確認，PULSE、NVIDIA 財測與客服代理則把同一個問題推到前台：能力擴張之後，誰來驗證來源、成本與責任邊界？',
    },
    {
      slug: 'ai-daily-2026-08-27',
      excerpt:
        'Anthropic 用三十兆美元描繪市場上限，研究、晶片與醫療設備則把焦點拉回可驗證的效能、風險與實際工作流程。',
    },
    {
      slug: 'ai-daily-2026-08-26',
      excerpt:
        'NVIDIA 把生成速度推向即時互動，Einride 用 500 輛 Tesla Semi 擴張智慧貨運；研究代理與個人助理也同時把管理能力、資料邊界推到產品核心。',
    },
    {
      slug: 'ai-daily-2026-08-25',
      excerpt:
        'Hugging Face 的潛在出售、企業轉向較便宜模型，以及創作者資料與自動化決策爭議，都指向同一個轉折：市場開始為分發、成本與控制權重新定價。',
    },
    {
      slug: 'ai-daily-2026-08-24',
      excerpt:
        'Target 把生成式搜尋導流寫進財報，越界代理則把供應鏈攻擊延伸到社交工程；另一份大型觀察研究，也讓內容授權與引用分配的關係浮上檯面。',
    },
    {
      slug: 'ai-daily-2026-08-21',
      excerpt:
        'Merck 與 Moderna 的個人化 mRNA 療法達成三期試驗終點，Cursor 把代理帶進程式碼託管，ChatGPT 的來源分布則突然改變；共同問題是平台如何證明自己的選擇。',
    },
    {
      slug: 'ai-daily-2026-08-20',
      excerpt:
        'OpenAI 以人工覆核通報暴力威脅，MIT 揭示生成模型的歸因衰減，醫療實驗與運算基礎設施同步擴張；關鍵不再只是能力，而是誰能解釋、覆核並承擔後果。',
    },
  ]) {
    test(`${slug} renders its leading excerpt exactly once`, async ({ page }) => {
      await page.goto(`/posts/2026/${slug}`)

      await expect(page.locator('article .prose > p.not-prose')).toHaveCount(0)
      await expect(page.locator('article .prose blockquote').first()).toHaveText(excerpt)
    })
  }

  test('keeps a standalone excerpt when the body does not begin with the same blockquote', async ({
    page,
  }) => {
    await page.goto('/posts/2026/ai-daily-2026-07-06')

    await expect(page.locator('article .prose > p.not-prose')).toHaveText(
      '好萊塢的版權訴訟照見片商自身的生成工具使用，教育與生命科學迎來新工作流，Meta 的未成年假帳號測試則把安全與競爭的界線推向灰區。'
    )
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

async function sourceArticleURLs() {
  const root = join(process.cwd(), 'content/posts')
  const paths: string[] = []
  for (const year of await readdir(root, { withFileTypes: true })) {
    if (!year.isDirectory()) continue
    for (const file of await readdir(join(root, year.name))) {
      if (!file.endsWith('.md')) continue
      const { data } = matter(await readFile(join(root, year.name, file), 'utf8'))
      if (data.status !== 'published') continue
      paths.push(
        `/posts/${new Date(data.publishedAt).getUTCFullYear()}/${data.slug ?? basename(file, '.md')}`
      )
    }
  }
  return paths.sort()
}

test.describe('Writing and metadata', () => {
  test('[writing] retains every published article URL, excluding drafts', async ({ page }) => {
    await page.goto('/posts')
    const hrefs = await page
      .locator('main a[href^="/posts/20"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).sort())
    expect(hrefs).toEqual(await sourceArticleURLs())
    await expect(page.locator('[data-writing-kind="translation"]')).toContainText('Andrew Ng')
    await expect(page.locator('[data-writing-kind="translation"]')).toContainText(
      '翻譯 · 2026年8月31日 · 原文：Andrew Ng'
    )
    await expect(page.locator('main')).not.toContainText('原創觀點')
  })

  test('[writing] indexes all daily articles at their original URLs', async ({ page }) => {
    await page.goto('/posts/ai-daily')
    await expect(page.getByRole('heading', { name: 'AI 日報', exact: true })).toBeVisible()
    const hrefs = await page
      .locator('main a[href^="/posts/20"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).sort())
    expect(hrefs).toEqual((await sourceArticleURLs()).filter((url) => url.includes('/ai-daily-')))
    await expect(page.locator('[data-writing-kind="translation"]')).toHaveCount(0)
  })

  test('[writing] offers truthful topic and series entry points', async ({ page }) => {
    await page.goto('/posts')
    const nav = page.getByRole('navigation', { name: '文章主題' })
    await expect(nav.getByRole('link', { name: 'AI 資訊', exact: true })).toHaveAttribute(
      'href',
      '/posts/ai-daily'
    )
    await nav.getByRole('link', { name: '軟體工程', exact: true }).click()
    await expect(
      page.locator('#writing-2026-ai-engineering-skills-map-software-engineering-fundamentals')
    ).toBeInViewport()
  })

  test('[writing] gives new pages public canonical URLs and page-specific metadata', async ({
    page,
  }) => {
    for (const path of [
      '/',
      '/about',
      '/story',
      '/work',
      '/work/gj',
      '/work/nidin',
      '/work/jurislm',
      '/posts',
      '/posts/ai-daily',
    ]) {
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW')
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://terry90918.github.io${path === '/' ? '' : path}`
      )
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'zh_TW')
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy()
      expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBeTruthy()
      await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute(
        'content',
        '@zxtw17985321'
      )
      if (path === '/') await expect(page).toHaveTitle('Terry Chen')
    }
  })

  test('[writing] sitemap retains source article URLs and adds only real public routes', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const xml = await response.text()
    for (const path of [
      ...(await sourceArticleURLs()),
      '/story',
      '/work',
      '/work/gj',
      '/work/nidin',
      '/work/jurislm',
      '/posts/ai-daily',
    ]) {
      expect(xml).toContain(`https://terry90918.github.io${path}`)
    }
    expect(xml).not.toContain('unverified-story')
  })
})

test('[writing] gives an existing article its own canonical and social title', async ({
  request,
}) => {
  const path = '/posts/2026/ai-engineering-skills-map-software-engineering-fundamentals'
  const response = await request.get(path)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]).toBe(
    `https://terry90918.github.io${path}`
  )
  expect(html.match(/<meta[^>]*name="twitter:creator"[^>]*content="([^"]+)"/)?.[1]).toBe(
    '@zxtw17985321'
  )
  expect(html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/)?.[1]).toBe(
    'AI 工程技能地圖：軟體工程基礎'
  )
})
