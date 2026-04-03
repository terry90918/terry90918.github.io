import { test, expect } from '@playwright/test'

test.describe('G. 前端 — 首頁各區塊', () => {
  test.describe('G1. 首頁整體載入', () => {
    test('訪問 / 頁面正確渲染無錯誤', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await page.goto('/')
      await expect(page).toHaveURL('/')
      // Check page loaded
      await expect(page.locator('body')).toBeVisible()
      // No JS errors
      expect(errors).toEqual([])
    })

    test('所有區塊依序顯示', async ({ page }) => {
      await page.goto('/')
      // Navigation
      await expect(page.locator('nav')).toBeVisible()
      // Hero
      await expect(page.locator('header').first()).toBeVisible()
      // About section
      await expect(page.locator('#about')).toBeVisible()
      // PracticeAreas section
      await expect(page.locator('#practice-areas')).toBeVisible()
      // Articles section
      await expect(page.locator('#articles')).toBeVisible()
      // Testimonials section
      await expect(page.locator('#testimonials')).toBeVisible()
      // Contact section
      await expect(page.locator('#contact')).toBeVisible()
      // Footer
      await expect(page.locator('footer').last()).toBeVisible()
    })
  })

  test.describe('G2. Navigation（導覽列）', () => {
    test('Logo 劉尹惠 顯示正確', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('nav')).toContainText('劉')
    })

    test('法律新知連結導向 /articles', async ({ page }) => {
      await page.goto('/')
      const articlesLink = page.locator('nav a:has-text("法律新知")')
      await expect(articlesLink).toBeVisible()
      await expect(articlesLink).toHaveAttribute('href', '/articles')
    })

    test('聯絡我們連結導向 #contact', async ({ page }) => {
      await page.goto('/')
      const contactLink = page.locator('nav a:has-text("聯絡我們")')
      await expect(contactLink).toBeVisible()
      await expect(contactLink).toHaveAttribute('href', '#contact')
    })
  })

  test.describe('G3. Hero（主視覺）', () => {
    test('主視覺圖片載入', async ({ page }) => {
      await page.goto('/')
      const heroImage = page.locator('img[alt="劉尹惠律師"]')
      await expect(heroImage).toBeVisible()
    })

    test('預約諮詢 CTA 按鈕可點擊且導向 #contact', async ({ page }) => {
      await page.goto('/')
      const ctaButton = page.locator('header a[href="#contact"]:has-text("預約諮詢")')
      await expect(ctaButton).toBeVisible()
      await expect(ctaButton).toHaveAttribute('href', '#contact')
    })

    test('文字 劉尹惠 律師 正確顯示', async ({ page }) => {
      await page.goto('/')
      const hero = page.locator('header').first()
      await expect(hero).toContainText('劉')
      await expect(hero).toContainText('尹惠')
      await expect(hero).toContainText('律師')
    })
  })

  test.describe('G4. About（關於）', () => {
    test('Section #about 正確渲染', async ({ page }) => {
      await page.goto('/')
      const aboutSection = page.locator('#about')
      await expect(aboutSection).toBeVisible()
    })

    test('統計數字顯示', async ({ page }) => {
      await page.goto('/')
      const aboutSection = page.locator('#about')
      await expect(aboutSection).toContainText('10+')
      await expect(aboutSection).toContainText('年執業經驗')
      await expect(aboutSection).toContainText('1000+')
      await expect(aboutSection).toContainText('服務案件')
    })

    test('標題 法律，是故事的集合 正確顯示', async ({ page }) => {
      await page.goto('/')
      const aboutSection = page.locator('#about')
      await expect(aboutSection).toContainText('法律，')
      await expect(aboutSection).toContainText('是故事的集合')
    })
  })

  test.describe('G5. PracticeAreas（專業服務）', () => {
    test('7 張服務卡片全部顯示', async ({ page }) => {
      await page.goto('/')
      const practiceSection = page.locator('#practice-areas')
      const areas = [
        '民事訴訟',
        '刑事辯護',
        '婚姻家事',
        '遺產繼承',
        '房地糾紛',
        '契約審閱',
        '法人顧問',
      ]
      for (const area of areas) {
        await expect(practiceSection).toContainText(area)
      }
    })
  })

  test.describe('G6. ArticlesSection（法律新知）', () => {
    test('顯示文章區塊', async ({ page }) => {
      await page.goto('/')
      const articlesSection = page.locator('#articles')
      await expect(articlesSection).toBeVisible()
      await expect(articlesSection).toContainText('法律新知')
    })

    test('查看全部文章連結導向 /articles', async ({ page }) => {
      await page.goto('/')
      const viewAllLink = page.locator('#articles a:has-text("查看全部文章")')
      await expect(viewAllLink.first()).toBeVisible()
      await expect(viewAllLink.first()).toHaveAttribute('href', '/articles')
    })

    test('文章卡片可點擊導向 /articles/{slug}', async ({ page }) => {
      await page.goto('/')
      const articleLinks = page.locator('#articles a[href^="/articles/"]')
      const count = await articleLinks.count()
      if (count > 0) {
        const href = await articleLinks.first().getAttribute('href')
        expect(href).toMatch(/^\/articles\/[\w-]+$/)
      }
    })
  })

  test.describe('G7. Testimonial（客戶評價）', () => {
    test('引用文字正確顯示', async ({ page }) => {
      await page.goto('/')
      const testimonialSection = page.locator('#testimonials')
      await expect(testimonialSection).toContainText('洞察現場氛圍')
      await expect(testimonialSection).toContainText('體察當事人的心情')
    })

    test('信任指標顯示', async ({ page }) => {
      await page.goto('/')
      const testimonialSection = page.locator('#testimonials')
      await expect(testimonialSection).toContainText('98%')
      await expect(testimonialSection).toContainText('客戶滿意度')
      await expect(testimonialSection).toContainText('4.9')
      await expect(testimonialSection).toContainText('Google 評分')
      await expect(testimonialSection).toContainText('85%')
      await expect(testimonialSection).toContainText('回頭客比例')
    })
  })

  test.describe('G8. Contact（聯絡我們）', () => {
    test('Section #contact 正確渲染', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#contact')).toBeVisible()
    })

    test('LINE 按鈕可點擊且導向正確', async ({ page }) => {
      await page.goto('/')
      const lineLink = page.locator('#contact a[href="https://lin.ee/nicHsmR"]')
      await expect(lineLink).toBeVisible()
      await expect(lineLink).toHaveAttribute('target', '_blank')
    })

    test('電話號碼為 tel: 連結', async ({ page }) => {
      await page.goto('/')
      const phoneLink = page.locator('#contact a[href="tel:+88636575067"]')
      await expect(phoneLink).toBeVisible()
      await expect(phoneLink).toContainText('03-657-5067')
    })

    test('仁大法律事務所連結正確', async ({ page }) => {
      await page.goto('/')
      const zendaLink = page.locator('#contact a[href="https://zenda-law.com/"]')
      await expect(zendaLink).toBeVisible()
      await expect(zendaLink).toContainText('仁大法律事務所')
      await expect(zendaLink).toHaveAttribute('target', '_blank')
    })
  })

  test.describe('G9. Footer（頁尾）', () => {
    test('版權文字包含當前年份', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer').last()
      const currentYear = new Date().getFullYear().toString()
      await expect(footer).toContainText(currentYear)
    })

    test('劉尹惠律師事務所文字正確', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer').last()
      await expect(footer).toContainText('劉尹惠律師事務所')
    })

    test('仁大法律事務所連結可點擊', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer').last()
      const zendaLink = footer.locator('a[href="https://zenda-law.com/"]')
      await expect(zendaLink).toBeVisible()
      await expect(zendaLink).toContainText('仁大法律事務所')
    })
  })

  test.describe('G10. FloatingCTA（浮動按鈕）', () => {
    test('向下滾動後出現預約諮詢浮動按鈕', async ({ page }) => {
      await page.goto('/')
      const floatingCTA = page.locator('.fixed a[href="#contact"]:has-text("預約諮詢")')
      await page.evaluate(() => window.scrollTo(0, window.innerHeight))
      await page.waitForTimeout(1000)
      await expect(floatingCTA).toBeVisible()
    })

    test('浮動按鈕導向 #contact', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => window.scrollTo(0, window.innerHeight))
      await page.waitForTimeout(1000)
      const floatingCTA = page.locator('.fixed a[href="#contact"]:has-text("預約諮詢")')
      await expect(floatingCTA).toHaveAttribute('href', '#contact')
    })
  })
})
