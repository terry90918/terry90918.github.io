export type ActivityMode = 'daily' | 'weekly' | 'cumulative'

export const illustrationDays = 52 * 7
export const estimatedDailyTokens = 7_500_000_000
export const estimatedTotalTokens = estimatedDailyTokens * illustrationDays
export const illustrationPalette = ['#6d2e10', '#b9480e', '#fc6a21', '#ff9e6c']

const seeds = { daily: 20261028, weekly: 753364, cumulative: 2730000 }

export function getIllustrationCells(mode: ActivityMode) {
  let seed = seeds[mode]
  return Array.from({ length: illustrationDays }, (_, index) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const month = Math.floor((Math.floor(index / 7) * 12) / 52)
    const level = 1 + ((seed >>> 16) % 4)
    return {
      month,
      level,
      color: illustrationPalette[level - 1],
    }
  })
}
