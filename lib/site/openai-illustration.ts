export type ActivityMode = 'daily' | 'weekly' | 'cumulative'

export const illustrationDays = 52 * 7
export const estimatedDailyTokens = 7_500_000_000
export const estimatedTotalTokens = estimatedDailyTokens * illustrationDays
export const illustrationPalette = ['#6d2e10', '#b9480e', '#fc6a21', '#ff9e6c']

export function getIllustrationCells(mode: ActivityMode) {
  let seed = 20261028
  const daily = Array.from({ length: illustrationDays }, (_, index) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const month = Math.floor((Math.floor(index / 7) * 12) / 52)
    const level = 1 + ((seed >>> 16) % 4)
    return { month, level, color: illustrationPalette[level - 1] }
  })
  if (mode === 'daily') return daily
  const values = Array.from({ length: illustrationDays / 7 }, (_, week) =>
    daily.slice(week * 7, week * 7 + 7).reduce((sum, cell) => sum + cell.level, 0)
  )
  if (mode === 'cumulative') {
    for (let week = 1; week < values.length; week++) values[week] += values[week - 1]
  }
  const maximum = Math.max(...values)
  const heights = values.map((value) => Math.ceil((value / maximum) * 7))
  return daily.map((cell, index) => {
    const level = index % 7 >= 7 - heights[Math.floor(index / 7)] ? 4 : 0
    return { ...cell, level, color: level === 4 ? illustrationPalette[2] : undefined }
  })
}
