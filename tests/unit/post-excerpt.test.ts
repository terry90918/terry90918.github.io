import { describe, expect, it } from 'vitest'
import { hasLeadingExcerptBlockquote } from '../../lib/posts/excerpt'
import type { Post } from '../../lib/posts/types'

describe('hasLeadingExcerptBlockquote()', () => {
  it('recognizes the excerpt when an ATX heading follows without a blank line', () => {
    const post = {
      excerpt: 'Excerpt',
      rawContent: '> Excerpt\n# Heading',
    } as Post

    expect(hasLeadingExcerptBlockquote(post)).toBe(true)
  })
})
