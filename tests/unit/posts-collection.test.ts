/**
 * Unit tests for Posts collection
 *
 * TDD - RED phase: These tests are written BEFORE the implementation.
 * They define the expected behavior of the Posts collection.
 */

import { describe, it, expect } from 'vitest'

// ---- slugify helper (exported from Posts.ts) ----
import { slugify } from '../../collections/Posts'

// ---- Posts collection config ----
import { Posts } from '../../collections/Posts'

describe('slugify()', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('lowercases the text', () => {
    expect(slugify('UPPER CASE')).toBe('upper-case')
  })

  it('trims leading and trailing spaces', () => {
    expect(slugify('  trim me  ')).toBe('trim-me')
  })

  it('collapses multiple spaces to single hyphen', () => {
    expect(slugify('a   b   c')).toBe('a-b-c')
  })

  it('removes special characters except hyphens and CJK', () => {
    expect(slugify('hello! world@2026')).toBe('hello-world2026')
  })

  it('preserves CJK characters', () => {
    const result = slugify('你好世界')
    expect(result).toBe('你好世界')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles string with only special characters', () => {
    expect(slugify('!!!@@@')).toBe('')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello')
  })
})

describe('Posts collection config', () => {
  it('has slug set to "posts"', () => {
    expect(Posts.slug).toBe('posts')
  })

  it('uses title as admin display field', () => {
    expect(Posts.admin?.useAsTitle).toBe('title')
  })

  it('has beforeValidate hook to auto-generate slug from title', () => {
    const hooks = Posts.hooks?.beforeValidate
    expect(hooks).toBeDefined()
    expect(Array.isArray(hooks)).toBe(true)
    expect(hooks!.length).toBeGreaterThan(0)
  })

  it('auto-generates slug when title is present but slug is missing', () => {
    const hooks = Posts.hooks?.beforeValidate
    const hookFn = hooks![0]
    const data = { title: 'My Test Post', slug: '' }
    const result = hookFn({ data } as unknown as Parameters<typeof hookFn>[0])
    // slug should be generated from title
    expect(result?.slug).toBe('my-test-post')
  })

  it('does not overwrite an existing slug', () => {
    const hooks = Posts.hooks?.beforeValidate
    const hookFn = hooks![0]
    const data = { title: 'My Test Post', slug: 'existing-slug' }
    const result = hookFn({ data } as unknown as Parameters<typeof hookFn>[0])
    expect(result?.slug).toBe('existing-slug')
  })

  describe('fields', () => {
    const fieldNames = (Posts.fields as Array<{ name: string }>).map((f) => f.name)

    it('has a "title" field', () => {
      expect(fieldNames).toContain('title')
    })

    it('has a "slug" field', () => {
      expect(fieldNames).toContain('slug')
    })

    it('has a "content" richText field', () => {
      const contentField = (Posts.fields as Array<{ name: string; type: string }>).find(
        (f) => f.name === 'content'
      )
      expect(contentField).toBeDefined()
      expect(contentField?.type).toBe('richText')
    })

    it('has a "status" field with default value "draft"', () => {
      const statusField = (
        Posts.fields as Array<{ name: string; type: string; defaultValue?: string }>
      ).find((f) => f.name === 'status')
      expect(statusField).toBeDefined()
      expect(statusField?.defaultValue).toBe('draft')
    })

    it('status field has "draft" and "published" options', () => {
      const statusField = (
        Posts.fields as Array<{
          name: string
          options?: Array<{ value: string }>
        }>
      ).find((f) => f.name === 'status')
      const values = statusField?.options?.map((o) => o.value)
      expect(values).toContain('draft')
      expect(values).toContain('published')
    })

    it('has a "publishedAt" field of type "date"', () => {
      const publishedAtField = (Posts.fields as Array<{ name: string; type: string }>).find(
        (f) => f.name === 'publishedAt'
      )
      expect(publishedAtField).toBeDefined()
      expect(publishedAtField?.type).toBe('date')
    })

    it('has a "readingTime" field of type "number"', () => {
      const readingTimeField = (Posts.fields as Array<{ name: string; type: string }>).find(
        (f) => f.name === 'readingTime'
      )
      expect(readingTimeField).toBeDefined()
      expect(readingTimeField?.type).toBe('number')
    })

    it('has an "excerpt" field', () => {
      expect(fieldNames).toContain('excerpt')
    })

    it('has a "tags" relationship field', () => {
      const tagsField = (
        Posts.fields as Array<{ name: string; type: string; relationTo?: string }>
      ).find((f) => f.name === 'tags')
      expect(tagsField).toBeDefined()
      expect(tagsField?.type).toBe('relationship')
      expect(tagsField?.relationTo).toBe('tags')
    })
  })

  describe('access control', () => {
    it('has access rules defined', () => {
      expect(Posts.access).toBeDefined()
    })

    it('read access returns filter for unauthenticated users', () => {
      const readFn = Posts.access?.read as (args: { req: { user: null } }) => unknown
      const result = readFn({ req: { user: null } })
      // Unauthenticated: should return a where clause, not true
      expect(result).not.toBe(true)
      expect(typeof result).toBe('object')
    })

    it('read access returns true for authenticated users', () => {
      const readFn = Posts.access?.read as (args: { req: { user: object } }) => unknown
      const result = readFn({ req: { user: { id: 1 } } })
      expect(result).toBe(true)
    })
  })
})
