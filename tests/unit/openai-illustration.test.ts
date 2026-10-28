import { describe, expect, it } from 'vitest'
import {
  illustrationDays,
  estimatedDailyTokens,
  estimatedTotalTokens,
  illustrationMonthHues,
  getIllustrationCells,
} from '../../lib/site/openai-illustration'

describe('OpenAI activity illustration', () => {
  it('estimates 52 weeks using the requested 7.5 billion daily tokens', () => {
    expect(illustrationDays).toBe(364)
    expect(estimatedDailyTokens).toBe(7_500_000_000)
    expect(estimatedTotalTokens).toBe(2_730_000_000_000)
  })

  it('fills every view with reproducible varied shades and twelve month colors', () => {
    const patterns = []
    expect(new Set(illustrationMonthHues).size).toBe(12)
    for (const mode of ['daily', 'weekly', 'cumulative'] as const) {
      const cells = getIllustrationCells(mode)
      expect(cells).toHaveLength(364)
      expect(cells).toEqual(getIllustrationCells(mode))
      expect(cells.every((cell) => cell.level >= 1 && cell.level <= 4)).toBe(true)
      expect(new Set(cells.map((cell) => cell.month)).size).toBe(12)
      for (const month of new Set(cells.map((cell) => cell.month))) {
        const shades = cells.filter((cell) => cell.month === month).map((cell) => cell.level)
        expect(new Set(shades).size).toBeGreaterThanOrEqual(3)
      }
      patterns.push(cells.map((cell) => cell.level).join(''))
    }
    expect(new Set(patterns).size).toBe(3)
  })
})
