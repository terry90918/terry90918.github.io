import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CodexProfile, WorkGallery } from '../../components/CodexShowcase'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const documentFor = (html: string) => new DOMParser().parseFromString(html, 'text/html')

describe('Public profile information split', () => {
  it('preserves the five selected works, their assets, attribution and login requirement', () => {
    const doc = documentFor(renderToStaticMarkup(<WorkGallery />))
    expect(doc.querySelectorAll('article')).toHaveLength(5)
    const links = [...doc.querySelectorAll('article h3 a')].map((a) => a.getAttribute('href'))
    expect(links).toEqual([
      'https://block-out-rainbow.terrytychen.chatgpt.site/',
      'https://bluewake-regatta.terrytychen.chatgpt.site/',
      'https://defecthunter-ai.terrytychen.chatgpt.site/',
      'https://ascii-sharks-ocean-terry.terrytychen.chatgpt.site/',
      'https://ochre-chess-studio.terrytychen.chatgpt.site/',
    ])
    for (const img of doc.querySelectorAll('article img')) {
      expect(img.getAttribute('alt')).toBeTruthy()
      const source = new URL(img.getAttribute('src')!, 'https://terry90918.github.io')
      const imagePath = source.searchParams.get('url') ?? source.pathname
      expect(existsSync(join(process.cwd(), 'public', imagePath))).toBe(true)
    }
    expect(doc.querySelector('a[href="https://github.com/stackedlol/ascii-sharks"]')).not.toBeNull()
    expect(doc.body.textContent).toContain('體驗需登入 ChatGPT')
    expect(doc.body.textContent).toContain('需人工複查')
  })

  for (const locale of ['zh-TW', 'en'] as const) {
    it(`shows labeled estimates without identity, plugins or insights in ${locale}`, () => {
      const doc = documentFor(renderToStaticMarkup(<CodexProfile locale={locale} />))
      expect(doc.querySelector('h2')?.textContent).toBe('OpenAI')
      expect(doc.querySelectorAll('[data-codex-stat]')).toHaveLength(5)
      expect(doc.querySelectorAll('[data-codex-insight]')).toHaveLength(0)
      expect(doc.querySelectorAll('[data-codex-plugin]')).toHaveLength(0)
      expect(doc.querySelector('.codex-profile-heading p')).toBeNull()
      expect(doc.body.textContent).toContain(locale === 'en' ? '2.73T' : '2.73 兆')
      expect(doc.body.textContent).toContain(
        locale === 'en' ? 'Estimated total tokens' : '推估累計 Token'
      )
      expect(doc.body.textContent).toContain(
        locale === 'en' ? 'Simulated longest streak' : '模擬最長連續紀錄'
      )
      expect(doc.body.textContent).toContain(locale === 'en' ? '364 days' : '364 天')
      expect(doc.body.textContent).toContain(locale === 'en' ? '8.44B' : '84.4 億')

      const activity = doc.getElementById('cv-codex-activity')
      expect(activity).not.toBeNull()
      expect(activity!.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
      expect([...activity!.querySelectorAll('button')].map((button) => button.textContent)).toEqual(
        locale === 'en' ? ['Daily', 'Weekly', 'Cumulative'] : ['每日', '每週', '累計']
      )
      expect(activity!.querySelectorAll('[data-activity-level]')).toHaveLength(364)
      expect(activity!.querySelectorAll('[data-activity-level="0"]')).toHaveLength(0)
      expect(activity!.querySelectorAll('[data-activity-month]')).toHaveLength(364)
      expect(activity!.querySelector('.codex-chart')?.getAttribute('role')).toBe('group')
      expect(activity!.querySelector('.codex-chart')?.getAttribute('aria-label')).toContain(
        locale === 'en' ? 'illustration' : '示意'
      )
      expect(doc.querySelector('a[href="https://chatgpt.com/u/terrytychen"]')).toBeNull()
    })
  }
})
