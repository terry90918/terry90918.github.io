import { describe, expect, it } from 'vitest'
import { formatPublishedDate } from '../../lib/date'

describe('formatPublishedDate()', () => {
  it('renders an early-morning Taiwan timestamp on its Taiwan calendar date', () => {
    expect(formatPublishedDate('2026-08-21T05:00:00+08:00')).toBe('August 21, 2026')
  })
})
