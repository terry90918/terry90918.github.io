export type ActivityMode = 'daily' | 'weekly' | 'cumulative'

export const illustrationDays = 52 * 7
export const estimatedDailyTokens = 7_500_000_000
export const estimatedTotalTokens = estimatedDailyTokens * illustrationDays
export const illustrationMonthHues = [18, 34, 50, 80, 124, 154, 178, 202, 228, 256, 290, 326]

const seeds = { daily: 20261028, weekly: 753364, cumulative: 2730000 }

export function getIllustrationCells(mode: ActivityMode) {
  let seed = seeds[mode]
  return Array.from({ length: illustrationDays }, (_, index) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const month = Math.floor((Math.floor(index / 7) * illustrationMonthHues.length) / 52)
    const level = 1 + ((seed >>> 16) % 4)
    return {
      month,
      level,
      color: `hsl(${illustrationMonthHues[month]} 68% ${28 + level * 9}%)`,
    }
  })
}
