import { describe, expect, it } from 'vitest'
import {
  illustrationDays,
  estimatedDailyTokens,
  estimatedTotalTokens,
  illustrationPalette,
  getIllustrationCells,
} from '../../lib/site/openai-illustration'

describe('OpenAI activity illustration', () => {
  it('estimates 52 weeks using the requested 7.5 billion daily tokens', () => {
    expect(illustrationDays).toBe(364)
    expect(estimatedDailyTokens).toBe(7_500_000_000)
    expect(estimatedTotalTokens).toBe(2_730_000_000_000)
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
      daily.slice(week * 7, week * 7 + 7).reduce((sum, cell) => sum + cell.level, 0)
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
