import snapshot from './codex-activity.json'
import type { Locale } from '@/lib/cv/profile'

export type ActivityMode = 'daily' | 'weekly' | 'cumulative'

export const illustrationDays = 52 * 7
export const estimatedDailyTokens = 7_500_000_000
export const estimatedTotalTokens = estimatedDailyTokens * illustrationDays
export const illustrationPalette = ['#6d2e10', '#b9480e', '#fc6a21', '#ff9e6c']

export function getIllustrationCells(mode: ActivityMode) {
  let seed = 20261028
  const weights = Array.from({ length: illustrationDays }, (_, index) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const month = Math.floor((Math.floor(index / 7) * 12) / 52)
    const level = 1 + ((seed >>> 16) % 4)
    return { month, level, color: illustrationPalette[level - 1] }
  })
  const day = 86_400_000
  const captured = new Date(`${snapshot.capturedAt}T00:00:00Z`)
  const last = captured.getTime() + ((7 - captured.getUTCDay()) % 7) * day
  const first = last - (illustrationDays - 1) * day
  const totalWeight = weights.reduce((sum, cell) => sum + cell.level, 0)
  let allocated = 0
  const daily = weights.map((cell, index) => {
    const tokens =
      index === weights.length - 1
        ? estimatedTotalTokens - allocated
        : Math.floor((estimatedTotalTokens * cell.level) / totalWeight)
    allocated += tokens
    return { ...cell, tokens, date: new Date(first + index * day).toISOString().slice(0, 10) }
  })
  if (mode === 'daily') return daily
  const values = Array.from({ length: illustrationDays / 7 }, (_, week) =>
    daily.slice(week * 7, week * 7 + 7).reduce((sum, cell) => sum + cell.tokens, 0)
  )
  if (mode === 'cumulative') {
    for (let week = 1; week < values.length; week++) values[week] += values[week - 1]
  }
  const maximum = Math.max(...values)
  const heights = values.map((value) => Math.ceil((value / maximum) * 7))
  return daily.map((cell, index) => {
    const level = index % 7 >= 7 - heights[Math.floor(index / 7)] ? 4 : 0
    const week = Math.floor(index / 7)
    const date = new Date(first + (week * 7 + (mode === 'cumulative' ? 6 : 0)) * day)
      .toISOString()
      .slice(0, 10)
    return {
      ...cell,
      level,
      tokens: values[week],
      date,
      color: level === 4 ? illustrationPalette[2] : undefined,
    }
  })
}

export function formatActivityTooltip({
  date,
  tokens,
  mode,
  locale,
}: {
  date: string
  tokens: number
  mode: ActivityMode
  locale: Locale
}) {
  const value = new Date(`${date}T00:00:00Z`)
  const monthDay = `${value.getUTCMonth() + 1}月${value.getUTCDate()}日`
  const fullDate = `${value.getUTCFullYear()}年${monthDay}`
  const englishDate = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: mode === 'daily' ? undefined : 'numeric',
    timeZone: 'UTC',
  }).format(value)
  const dateLabel =
    locale === 'zh-TW'
      ? mode === 'daily'
        ? monthDay
        : mode === 'weekly'
          ? `${fullDate} 起的一週`
          : `累計至 ${fullDate} 當週`
      : mode === 'daily'
        ? englishDate
        : mode === 'weekly'
          ? `Week of ${englishDate}`
          : `Through week ending ${englishDate}`
  const tokenLabel =
    locale === 'zh-TW'
      ? `推估 ${new Intl.NumberFormat('zh-TW', { useGrouping: false, maximumFractionDigits: 1 }).format(tokens / 100_000_000)}億 個 token`
      : `Estimated ${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(tokens)} tokens`
  return { dateLabel, tokenLabel }
}
