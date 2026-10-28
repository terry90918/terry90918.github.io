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

  it('fills every month with reproducible shades from the reference orange palette', () => {
    const patterns = []
    expect(illustrationPalette).toEqual(['#6d2e10', '#b9480e', '#fc6a21', '#ff9e6c'])
    for (const mode of ['daily', 'weekly', 'cumulative'] as const) {
      const cells = getIllustrationCells(mode)
      expect(cells).toHaveLength(364)
      expect(cells).toEqual(getIllustrationCells(mode))
      expect(cells.every((cell) => cell.level >= 1 && cell.level <= 4)).toBe(true)
      expect(cells.every((cell) => illustrationPalette.includes(cell.color))).toBe(true)
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
