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
  it('removes only the unconfirmed delivery claim from the existing Nidin case', async () => {
    const doc = documentFor(
      renderToStaticMarkup(await WorkCasePage({ params: Promise.resolve({ slug: 'nidin' }) }))
    )
    expect(doc.body.textContent).toContain('820 萬會員')
    expect(doc.body.textContent).toContain('1,500 萬筆以上訂單')
    expect(doc.body.textContent).not.toContain('55 項')
  })
  it('renders five chronological chapters while preserving existing experience anchors', () => {
    const doc = documentFor(renderToStaticMarkup(<StoryPage />))
    expect([...doc.querySelectorAll('[data-story-note] h2')].map((n) => n.textContent)).toEqual([
      '從書店走進開發',
      '和團隊一起做 GJ',
      '從產品開發到團隊搭建',
      '在 Nidin，持續做系統與帶團隊',
      '開始自己的 AI 工作',
    ])
    for (const id of ['gj', 'nidin', 'ai-work']) {
      expect(doc.getElementById(id)?.querySelector('a[href^="/work"]')).not.toBeNull()
    }
    expect(doc.getElementById('nidin')?.textContent).toContain('直接管理 10 位工程師')
  })

  it('puts Nidin first and exposes the concrete TPI responsibilities without a new case URL', () => {
    const doc = documentFor(renderToStaticMarkup(<WorkPage />))
    expect(doc.querySelector('article h3')?.textContent).toBe('Nidin 你訂')
    const tpi = doc.getElementById('tpi')
    expect(tpi?.textContent).toContain('20 人規模的團隊')
    expect(tpi?.textContent).not.toMatch(/直接管理|直屬/)
    expect(tpi?.querySelectorAll('li')).toHaveLength(3)
    expect(tpi?.textContent).toContain('機關權限')
    expect(tpi?.textContent).toContain('資料清洗')
    expect(tpi?.textContent).toContain('資安弱點掃描')
    expect(
      [...doc.querySelectorAll('a[href^="/work/"]')].map((n) => n.getAttribute('href'))
    ).toEqual(['/work/nidin', '/work/gj', '/work/jurislm'])
    expect(doc.body.textContent).not.toContain('55 項')
  })

  it('provides the approved About greeting, reading paths and independent CV', () => {
    const doc = documentFor(renderToStaticMarkup(<AboutPage />))
    expect(doc.querySelector('h1')?.textContent).toBe('嗨，我是 Terry。')
    for (const [text, href] of [
      ['讀我的故事', '/story'],
      ['看精選作品', '/work'],
      ['閱讀文章', '/posts'],
      ['完整 CV', 'https://terry90918.github.io/cv/'],
    ]) {
      expect(
        [...doc.querySelectorAll('a')].some(
          (a) => a.textContent === text && a.getAttribute('href') === href
        )
      ).toBe(true)
    }
  })

  it('keeps homepage experiences brief, with Nidin first instead of repeating the full story', async () => {
    const doc = documentFor(renderToStaticMarkup(await HomePage()))
    const entries = doc.querySelector('[data-testid="experience-entries"]')!
    expect(entries.querySelectorAll('article')).toHaveLength(3)
    expect(entries.querySelector('a')?.getAttribute('href')).toBe('/story#nidin')
    expect(entries.textContent).not.toContain('材料工程畢業後')
    expect(doc.querySelector('[data-home-section="work"] a')?.getAttribute('href')).toBe(
      '/work/nidin'
    )
  })
})
