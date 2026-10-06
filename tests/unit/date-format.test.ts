import { describe, expect, it } from 'vitest'
import { formatPublishedDate } from '../../lib/date'

describe('Publication date display', () => {
  it('renders an early-morning Taiwan timestamp on its Taiwan calendar date', () => {
    expect(formatPublishedDate('2026-08-21T05:00:00+08:00')).toBe('August 21, 2026')
  })
  it('preserves the existing English display for callers without a locale', () => {
    expect(formatPublishedDate('2026-09-30T18:00:00Z')).toBe('October 1, 2026')
  })
  it('uses a Traditional Chinese date for writing cards', () => {
    expect(formatPublishedDate('2026-08-31T00:00:00Z', 'zh-TW')).toBe('2026年8月31日')
  })
  it('keeps the Taiwan day across a UTC midnight boundary', () => {
    expect(formatPublishedDate('2026-09-30T18:00:00Z', 'zh-TW')).toBe('2026年10月1日')
  })
})
