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

const cv = '/cv'
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
    await expect(
      page.getByTestId('experience-entries').getByRole('link', { name: '讀這段經歷' })
    ).toHaveCount(3)
    await expect(page.locator('main')).not.toContainText(/820 萬|1,500 萬|0\.957|敬請期待/)
    await expect(page.locator('main a[href="#"]')).toHaveCount(0)
  })

  test('[brand] provides factual sections for all three experience links', async ({ page }) => {
    for (const id of ['gj', 'nidin', 'ai-work']) {
      await page.goto('/')
      await page.locator(`a[href="/story#${id}"]`).first().click()
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
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    await expect(page.getByRole('banner').getByRole('link', { name: '聯絡' })).toHaveAttribute(
      'href',
      email
    )
    await page.getByRole('link', { name: 'Terry.TY Chen', exact: true }).click()
    await expect(page).toHaveURL('/')
  })

  test('mobile navigation opens by keyboard and closes on Escape and navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto('/')
    const menu = page.getByRole('button', { name: '導覽選單' })
    const nav = page.getByRole('navigation', { name: '手機導覽', includeHidden: true })
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
      if (await menu.evaluate((el) => el === document.activeElement)) break
    }
    await expect(menu).toBeFocused()
    await expect(menu).toHaveCSS('outline-style', 'solid')
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(nav).toBeVisible()
    for (const [name, href] of [
      ['關於我', '/about'],
      ['故事', '/story'],
      ['作品', '/work'],
      ['文章', '/posts'],
      ['CV', cv],
      ['聯絡', email],
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible()
      await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    await page.keyboard.press('Tab')
    await expect(nav.getByRole('link', { name: '關於我', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    await expect(menu).toBeFocused()
    await page.keyboard.press('Enter')
    await nav.getByRole('link', { name: '關於我', exact: true }).click()
    await expect(page).toHaveURL('/about')
    await expect(
      nav.getByRole('link', { name: '關於我', exact: true, includeHidden: true })
    ).toHaveAttribute('aria-current', 'page')
    await expect(
      nav.getByRole('link', { name: '聯絡', exact: true, includeHidden: true })
    ).not.toHaveAttribute('aria-current')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    await expect(menu).toBeFocused()
  })

  test('[brand] limits daily updates and credits the translation in the article index', async ({
    page,
  }) => {
    await page.goto('/')
    const updates = page.getByTestId('home-updates')
    expect(await updates.locator('[data-writing-kind="ai-daily"]').count()).toBeLessThanOrEqual(1)
    expect(await updates.locator('article').count()).toBeLessThanOrEqual(3)
    await page.goto('/posts')
    await expect(
      page.locator('[data-writing-kind="translation"]').filter({ hasText: 'Andrew Ng' })
    ).toContainText('AI 工程技能地圖：軟體工程基礎')
  })

  test('[brand] publishes only the selected work cases and returns 404 for others', async ({
    page,
  }) => {
    await page.goto('/work')
    for (const slug of ['gj', 'nidin', 'jurislm']) {
      await expect(page.locator(`main a[href="/work/${slug}"]`).first()).toBeVisible()
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
    await expect(page.getByRole('heading', { name: '關於我', exact: true })).toBeVisible()
    await expect(page.getByTestId('about-profile')).toContainText(
      '嗨，我是 Terry。這個網站放我做過的產品、幾段經歷與持續整理的 AI 資訊。'
    )
    await expect(page.locator('main')).not.toContainText(/敬請期待|熱愛旅行|人生使命/)
    for (const href of [
      'https://github.com/terry90918',
      'https://x.com/zxtw17985321',
      'https://www.linkedin.com/in/tien-yi-chen-98812812a',
      email,
    ]) {
      await expect(page.getByTestId('about-connect').locator(`a[href="${href}"]`)).toBeVisible()
    }
  })

  test('content links use readable accent colors in light and dark themes', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('/')
    const link = page
      .getByTestId('experience-entries')
      .getByRole('link', { name: '讀這段經歷' })
      .first()
    const title = page.getByTestId('experience-entries').getByRole('heading').first()
    await expect(title).toHaveCSS('color', 'rgb(26, 26, 26)')
    await expect(link).toHaveCSS('color', 'rgb(184, 59, 8)')
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(link).toHaveCSS('color', 'rgb(255, 140, 80)')
    await expect(title).toHaveCSS('color', 'rgb(250, 250, 250)')
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
          if (width <= 700) {
            await expect(page.getByRole('button', { name: '導覽選單' })).toBeVisible()
            await expect(page.getByRole('banner').locator('.site-header-contact')).toBeHidden()
            await expect(page.getByRole('navigation', { name: '主要導覽' })).toBeHidden()
          } else {
            await expect(
              page
                .getByRole('navigation', { name: '主要導覽' })
                .getByRole('link', { name: 'CV', exact: true })
            ).toBeVisible()
          }
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
    const footer = page.locator('footer')
    await expect(footer).toContainText('CC BY 4.0 · Code MIT')
    for (const [name, href] of [
      ['GitHub', 'https://github.com/terry90918'],
      ['X (Twitter)', 'https://x.com/zxtw17985321'],
      ['LinkedIn', 'https://www.linkedin.com/in/tien-yi-chen-98812812a'],
      ['CV', cv],
      ['聯絡', email],
    ]) {
      await expect(footer.getByRole('link', { name, exact: true })).toBeVisible()
      await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
  })

  test('[brand] Nidin related work clears the sticky header after cross-page navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto('/story#nidin')
    await page.locator('#nidin').getByRole('link', { name: '看相關作品' }).click()
    await expect(page).toHaveURL('/work/nidin')
    await waitForScrollToSettle(page)
    const target = await page.locator('main h1').boundingBox()
    const header = await page.getByRole('banner').boundingBox()
    expect(target?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0))
    expect(target?.y).toBeLessThan(page.viewportSize()?.height ?? 0)
  })
})

// ---- Post detail pages ----
test.describe('Post detail pages', () => {
  for (const width of [320, 375]) {
    test(`[mobile visual] new Harness articles fit the viewport at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of [
        '/posts/2026/openai-harness-engineering-beginner-guide',
        '/posts/2026/designing-harness-for-codex-app',
      ]) {
        await page.goto(path)
        const article = page.locator('main article')
        await expect(article.getByRole('heading', { level: 1 })).toBeVisible()
        await expect(article.locator('.prose h2').first()).toBeVisible()
        await expect(article.locator('.prose > div > p').first()).toBeVisible()
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
          )
        ).toBe(true)
        for (const locator of [article, article.getByRole('heading', { level: 1 })]) {
          const box = await locator.boundingBox()
          expect(box).not.toBeNull()
          expect(box!.x).toBeGreaterThanOrEqual(0)
          expect(box!.x + box!.width).toBeLessThanOrEqual(width)
        }
      }
    })
  }

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

  for (const { slug, excerpt, rendering } of [
    {
      slug: 'ai-daily-2026-08-28',
      excerpt:
        'NVIDIA 收購 Hugging Face 的報導尚待確認，PULSE、NVIDIA 財測與客服代理則把同一個問題推到前台：能力擴張之後，誰來驗證來源、成本與責任邊界？',
      rendering: 'blockquote',
    },
    {
      slug: 'ai-daily-2026-08-27',
      excerpt:
        '三十兆美元市場、極端風險模擬、推論晶片與自動採血，分別把 AI 推向金融、研究、運算與醫療現場；測試口徑與可驗證性決定宣稱能走多遠。',
      rendering: 'standalone',
    },
    {
      slug: 'ai-daily-2026-08-26',
      excerpt:
        'Groq 3 LPX把推論速度推上前台，Einride準備把電動貨運接入AI調度，Faraday則讓研究代理負責挑選實驗。平台產品、資料權限與專用晶片也在改寫各自產業的落地方式。',
      rendering: 'blockquote',
    },
    {
      slug: 'ai-daily-2026-08-25',
      excerpt:
        '從 Hugging Face 的開放模型平台到企業選模、創作者授權、AI 生技與算力融資，競爭焦點正從模型能力延伸到資料控制、商業化與成本。',
      rendering: 'standalone',
    },
    {
      slug: 'ai-daily-2026-08-24',
      excerpt:
        'Target 開始量化生成式 AI 帶來的購物流量；代理越界、工業控制器風險與出版授權研究，則把安全和平台規則推到台前。',
      rendering: 'standalone',
    },
    {
      slug: 'ai-daily-2026-08-21',
      excerpt:
        'Merck 與 Moderna 公布個人化癌症疫苗三期試驗結果，Cursor 推出程式碼託管平台；OpenAI、NVIDIA 與其他公司文件也呈現搜尋、資料保護和基礎設施的條件與限制。未獲獨立確認的數字會明確標示歸屬。',
      rendering: 'standalone',
    },
    {
      slug: 'ai-daily-2026-08-20',
      excerpt:
        'ChatGPT 威脅通報、擴散模型資料歸因、Cursor 與 SpaceX，以及 Vivodyne 的人體組織實驗，呈現 AI 應用在安全、研究與醫療上的新問題。本文區分官方政策、研究結果與尚未獨立確認的事件細節。',
      rendering: 'standalone',
    },
  ]) {
    test(`${slug} renders its excerpt exactly once using the current body contract`, async ({
      page,
    }) => {
      await page.goto(`/posts/2026/${slug}`)

      if (rendering === 'blockquote') {
        await expect(page.locator('article .prose > p.not-prose')).toHaveCount(0)
        await expect(page.locator('article .prose blockquote').first()).toHaveText(excerpt)
      } else {
        await expect(page.locator('article .prose > p.not-prose')).toHaveText(excerpt)
        await expect(
          page.locator('article .prose blockquote').filter({ hasText: excerpt })
        ).toHaveCount(0)
      }
      await expect(page.getByText(excerpt, { exact: true })).toHaveCount(1)
    })
  }

  test('keeps a standalone excerpt when the body does not begin with the same blockquote', async ({
    page,
  }) => {
    const { data } = matter(
      await readFile(join(process.cwd(), 'content/posts/2026/ai-daily-2026-07-06.md'), 'utf8')
    )
    expect(data.excerpt).toEqual(expect.any(String))
    await page.goto('/posts/2026/ai-daily-2026-07-06')

    await expect(page.locator('article .prose > p.not-prose')).toHaveText(data.excerpt)
    await expect(page.locator('article .prose blockquote').first()).not.toHaveText(data.excerpt)
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
      .locator('main [data-writing-kind]')
      .filter({ hasNotText: '草稿（開發預覽）' })
      .locator('a[href^="/posts/20"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).sort())
    expect(hrefs).toEqual(await sourceArticleURLs())
    const andrewTranslation = page
      .locator('[data-writing-kind="translation"]')
      .filter({ hasText: 'AI 工程技能地圖：軟體工程基礎' })
    await expect(andrewTranslation).toContainText('Andrew Ng')
    await expect(andrewTranslation.locator('.site-writing-meta > span')).toHaveText([
      '翻譯',
      '2026年8月31日',
      '原文：Andrew Ng',
    ])
    const coinbaseTranslation = page
      .locator('[data-writing-kind="translation"]')
      .filter({ hasText: 'Coinbase 如何讓 1,000 多名工程師真正用上 AI' })
    await expect(coinbaseTranslation.locator('.site-writing-meta > span')).toHaveText([
      '翻譯',
      '2026年10月13日',
      '原文：Chintan Turakhia',
    ])
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

  test('[writing] matches the selected design with only the AI series entry point', async ({
    page,
  }) => {
    await page.goto('/posts')
    const nav = page.getByRole('navigation', { name: '文章主題' })
    await expect(nav.getByRole('link')).toHaveText(['AI 資訊'])
    await expect(nav.getByRole('link', { name: 'AI 資訊', exact: true })).toHaveAttribute(
      'href',
      '/posts/ai-daily'
    )
    await expect(page.locator('#all-posts')).toHaveCount(1)
    await expect(
      page.locator('#writing-2026-ai-engineering-skills-map-software-engineering-fundamentals')
    ).toHaveCount(1)
    await nav.getByRole('link', { name: 'AI 資訊', exact: true }).click()
    await expect(page).toHaveURL('/posts/ai-daily')
    await expect(page.getByRole('heading', { name: 'AI 日報', exact: true })).toBeVisible()
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
