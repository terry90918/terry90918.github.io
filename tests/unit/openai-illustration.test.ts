import { describe, expect, it } from 'vitest'
import {
  illustrationDays,
  estimatedDailyTokens,
  estimatedTotalTokens,
  illustrationPalette,
  getIllustrationCells,
  formatActivityTooltip,
} from '../../lib/site/openai-illustration'

describe('OpenAI activity illustration', () => {
  it('estimates 52 weeks using the requested 7.5 billion daily tokens', () => {
    expect(illustrationDays).toBe(364)
    expect(estimatedDailyTokens).toBe(7_500_000_000)
    expect(estimatedTotalTokens).toBe(2_730_000_000_000)
    const daily = getIllustrationCells('daily')
    expect(daily.reduce((sum, cell) => sum + cell.tokens, 0)).toBe(estimatedTotalTokens)
    expect(daily[0].date).toBe('2025-11-03')
    expect(daily.at(-1)?.date).toBe('2026-11-01')
    expect(getIllustrationCells('cumulative').at(-1)?.tokens).toBe(estimatedTotalTokens)
    expect(
      formatActivityTooltip({
        date: '2026-09-23',
        tokens: 3_590_000_000,
        mode: 'daily',
        locale: 'zh-TW',
      })
    ).toEqual({ dateLabel: '9月23日', tokenLabel: '推估 35.9億 個 token' })
    expect(
      formatActivityTooltip({
        date: '2026-08-17',
        tokens: 5_390_000_000,
        mode: 'weekly',
        locale: 'zh-TW',
      }).dateLabel
    ).toBe('2026年8月17日 起的一週')
    expect(
      formatActivityTooltip({
        date: '2026-10-04',
        tokens: 103_270_000_000,
        mode: 'cumulative',
        locale: 'zh-TW',
      })
    ).toEqual({ dateLabel: '累計至 2026年10月4日 當週', tokenLabel: '推估 1032.7億 個 token' })
    expect(
      formatActivityTooltip({
        date: '2026-10-04',
        tokens: estimatedDailyTokens,
        mode: 'cumulative',
        locale: 'en',
      })
    ).toEqual({ dateLabel: 'Through week ending Oct 4, 2026', tokenLabel: 'Estimated 7.5B tokens' })
  })

  it('derives orange weekly bars and cumulative steps from the full daily heatmap', () => {
    expect(illustrationPalette).toEqual(['#6d2e10', '#b9480e', '#fc6a21', '#ff9e6c'])
    const daily = getIllustrationCells('daily')
    expect(daily).toHaveLength(364)
    expect(daily).toEqual(getIllustrationCells('daily'))
    expect(daily.every((cell) => cell.level >= 1 && cell.level <= 4)).toBe(true)
    expect(
      daily.every((cell) => cell.color !== undefined && illustrationPalette.includes(cell.color))
    ).toBe(true)
    expect(new Set(daily.map((cell) => cell.month)).size).toBe(12)
    for (const month of new Set(daily.map((cell) => cell.month))) {
      expect(
        new Set(daily.filter((cell) => cell.month === month).map((cell) => cell.level)).size
      ).toBeGreaterThanOrEqual(3)
    }
    const weekly = Array.from({ length: 52 }, (_, week) =>
      daily.slice(week * 7, week * 7 + 7).reduce((sum, cell) => sum + cell.tokens, 0)
    )
    let total = 0
    const cumulative = weekly.map((value) => (total += value))
    for (const [mode, values] of [
      ['weekly', weekly],
      ['cumulative', cumulative],
    ] as const) {
      const cells = getIllustrationCells(mode)
      expect(cells).toHaveLength(364)
      expect(cells).toEqual(getIllustrationCells(mode))
      for (let week = 0; week < 52; week++) {
        const height = Math.ceil((values[week] / Math.max(...values)) * 7)
        const column = cells.slice(week * 7, week * 7 + 7)
        expect(column.every((cell) => cell.tokens === values[week])).toBe(true)
        expect(new Date(`${column[0].date}T00:00:00Z`).getUTCDay()).toBe(mode === 'weekly' ? 1 : 0)

        expect(column.map((cell) => cell.level)).toEqual(
          Array.from({ length: 7 }, (_, row) => (row >= 7 - height ? 4 : 0))
        )
        expect(
          column.filter((cell) => cell.level !== 0).every((cell) => cell.color === '#fc6a21')
        ).toBe(true)
        expect(
          column.filter((cell) => cell.level === 0).every((cell) => cell.color === undefined)
        ).toBe(true)
      }
    }
    expect(
      getIllustrationCells('cumulative')
        .slice(-7)
        .every((cell) => cell.level === 4)
    ).toBe(true)
  })
})
