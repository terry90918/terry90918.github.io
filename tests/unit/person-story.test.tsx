import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import StoryPage from '../../app/(frontend)/story/page'
import WorkPage from '../../app/(frontend)/work/page'
import AboutPage from '../../app/(frontend)/about/page'
import HomePage from '../../app/(frontend)/page'
import WorkCasePage from '../../app/(frontend)/work/[slug]/page'

function documentFor(html: string) {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('Approved personal story reading paths', () => {
  it('places the confirmed delivery statement in the second Nidin evidence row', async () => {
    const doc = documentFor(
      renderToStaticMarkup(await WorkCasePage({ params: Promise.resolve({ slug: 'nidin' }) }))
    )
    expect(doc.querySelector('section[aria-labelledby="role-title"]')).not.toBeNull()
    expect(doc.querySelector('section[aria-labelledby="delivery-title"]')).not.toBeNull()
    expect(doc.body.textContent).toContain('820 萬會員')
    expect(doc.body.textContent).toContain('1,500 萬筆以上訂單')
    const evidence = doc.querySelectorAll('.site-evidence li')
    expect(evidence).toHaveLength(3)
    expect(evidence[1]?.textContent).toBe(
      '任職期間主導 55 項產品交付；當時平台支援 820 萬會員與每年 1,500 萬筆以上訂單。'
    )
  })
  it('describes Nidin team responsibilities without a management headcount', async () => {
    const doc = documentFor(
      renderToStaticMarkup(await WorkCasePage({ params: Promise.resolve({ slug: 'nidin' }) }))
    )
    expect(doc.querySelector('section[aria-labelledby="role-title"]')?.textContent).toContain(
      '雲仲資訊技術經理'
    )
    expect(doc.querySelectorAll('.site-evidence li')[2]?.textContent).toBe(
      '管理工程部門團隊，協助工作分派與技術決策。'
    )
    expect(doc.body.textContent).not.toMatch(/直接管理|10\s*位工程師/)
  })
  it('renders the three selected design chapters and their work links', () => {
    const doc = documentFor(renderToStaticMarkup(<StoryPage />))
    expect([...doc.querySelectorAll('[data-story-note] h2')].map((n) => n.textContent)).toEqual([
      '共同創辦 GJ 的那段時間',
      '在 Nidin，做系統，也帶團隊',
      '從點餐平台到法律與旅遊 AI',
    ])
    for (const id of ['gj', 'nidin', 'ai-work']) {
      expect(doc.getElementById(id)?.querySelector('a[href^="/work"]')).not.toBeNull()
    }
    expect(doc.getElementById('nidin')?.querySelector('.site-split-index')?.textContent).toBe('02')
    expect(doc.getElementById('nidin')?.textContent).toContain(
      '2021 年到 2025 年，我在雲仲資訊擔任技術經理'
    )
  })

  it('follows the selected product, platform and AI order with concise supporting work', () => {
    const doc = documentFor(renderToStaticMarkup(<WorkPage />))
    expect(doc.querySelector('article h3')?.textContent).toBe('GJ')
    expect(doc.getElementById('vclass')?.textContent).toContain(
      '核心負責從零建置並推出線上課程平台'
    )
    expect(doc.getElementById('channel-t')?.textContent).toContain('旅行產品平台')
    expect(
      [...doc.querySelectorAll('article h3 a[href^="/work/"]')].map((n) => n.getAttribute('href'))
    ).toEqual(['/work/gj', '/work/nidin', '/work/jurislm'])
    expect(doc.body.textContent).not.toContain('55 項')
  })

  it('provides the approved About greeting, reading paths and integrated CV', () => {
    const doc = documentFor(renderToStaticMarkup(<AboutPage />))
    expect(doc.querySelector('h1')?.textContent).toBe('關於我')
    for (const [text, href] of [
      ['幾段經歷', '/story'],
      ['作品頁', '/work'],
      ['文章索引', '/posts'],
      ['CV', '/cv'],
    ]) {
      expect(
        [...doc.querySelectorAll('a')].some(
          (a) => a.textContent === text && a.getAttribute('href') === href
        )
      ).toBe(true)
    }
  })

  it('keeps the three homepage experience entries in the selected design order', async () => {
    const doc = documentFor(renderToStaticMarkup(await HomePage()))
    const entries = doc.querySelector('[data-testid="experience-entries"]')!
    expect(entries.querySelectorAll('article')).toHaveLength(3)
    expect(entries.querySelector('a')?.getAttribute('href')).toBe('/story#gj')
    expect(entries.textContent).not.toContain('材料工程畢業後')
    expect(doc.querySelector('[data-home-section="work"] article a')?.getAttribute('href')).toBe(
      '/work/gj'
    )
  })
})
