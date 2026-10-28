import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CodexActivity, CodexProfile, WorkGallery } from '../../components/CodexShowcase'
import snapshot from '../../lib/site/codex-activity.json'
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
    it(`keeps all OpenAI metrics and plugins without the removed footer in ${locale}`, () => {
      const doc = documentFor(renderToStaticMarkup(<CodexProfile locale={locale} />))
      expect(doc.querySelector('h2')?.textContent).toBe('OpenAI')
      expect(doc.querySelectorAll('[data-codex-stat]')).toHaveLength(5)
      expect(doc.querySelectorAll('[data-codex-insight]')).toHaveLength(4)
      expect(doc.querySelectorAll('[data-codex-plugin]')).toHaveLength(4)
      for (const text of ['295', '15,487', '33%', '0%', 'Superpowers', 'Linear', 'dot', 'GitHub']) {
        expect(doc.body.textContent).toContain(text)
      }
      expect(doc.body.textContent).toContain(locale === 'en' ? '153.38B' : '1533.8 億')
      expect(doc.body.textContent).toContain(locale === 'en' ? '8.44B' : '84.4 億')
      expect(doc.querySelector('.codex-source')).toBeNull()
      expect(doc.querySelector('a[href="/work"]')).toBeNull()
      const superpowers = doc.querySelector('[data-codex-plugin] img')
      expect(superpowers?.getAttribute('src')).toBe('/images/work/superpowers.svg')
      expect(existsSync(join(process.cwd(), 'public/images/work/superpowers.svg'))).toBe(true)
      const activity = doc.getElementById('cv-codex-activity')
      expect(activity).not.toBeNull()
      expect([...activity!.querySelectorAll('button')].map((button) => button.textContent)).toEqual(
        locale === 'en' ? ['Daily', 'Weekly', 'Cumulative'] : ['每日', '每週', '累計']
      )
      expect(activity!.querySelectorAll('[data-activity-level]')).toHaveLength(
        snapshot.daily.length
      )
      expect(activity!.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain(
        snapshot.capturedAt
      )
      expect(doc.querySelector('a[href="https://chatgpt.com/u/terrytychen"]')).not.toBeNull()
    })
  }

  it('uses captured source cell levels and keeps all three activity views available', () => {
    expect([snapshot.daily.length, snapshot.weekly.length, snapshot.cumulative.length]).toEqual([
      361, 364, 364,
    ])
    for (const levels of [snapshot.daily, snapshot.weekly, snapshot.cumulative]) {
      expect(levels.length).toBeGreaterThan(350)
      expect(levels.length).toBeLessThanOrEqual(364)
      expect(levels).toMatch(/^[0-4]+$/)
    }
    expect(new Set([snapshot.daily, snapshot.weekly, snapshot.cumulative]).size).toBe(3)
    const doc = documentFor(renderToStaticMarkup(<CodexActivity />))
    expect([...doc.querySelectorAll('button')].map((b) => b.textContent)).toEqual([
      '每日',
      '每週',
      '累計',
    ])
    expect(doc.querySelectorAll('[data-activity-level]')).toHaveLength(snapshot.daily.length)
    expect(doc.querySelector('.codex-chart')?.getAttribute('aria-describedby')).toBe(
      'activity-summary'
    )
    expect(doc.querySelector('#activity-summary')?.textContent).toContain('361 個方格')
    expect(doc.querySelector('#activity-summary')?.textContent).toContain('137 個為非零色階')
    expect(doc.querySelector('#activity-summary')?.textContent).toContain('色階 4')
    expect(doc.body.textContent).toContain('2026-10-28')
    expect(doc.querySelector('a[href="/cv/zh-TW#codex-profile"]')).not.toBeNull()
  })
})
