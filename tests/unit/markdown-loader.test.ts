import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { loadAllPosts } from '../../lib/posts/loader'

const VALID_POST = `---
title: Test Post
publishedAt: "2026-04-23T10:00:00+08:00"
status: published
excerpt: A test post
tags:
  - typescript
  - testing
---

# Hello World

This is the **content** of the test post.

## Section Two

More content here.
`

const DRAFT_POST = `---
title: Draft Post
publishedAt: "2026-04-22T10:00:00+08:00"
status: draft
---

Draft content.
`

let tempDir: string

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'blog-test-'))
  mkdirSync(join(tempDir, '2026'), { recursive: true })
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

describe('loadAllPosts()', () => {
  it('loads a valid post from the filesystem', async () => {
    writeFileSync(join(tempDir, '2026', 'test-post.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts).toHaveLength(1)
    expect(posts[0].title).toBe('Test Post')
    expect(posts[0].slug).toBe('test-post')
    expect(posts[0].status).toBe('published')
  })

  it('derives slug from filename when not in frontmatter', async () => {
    writeFileSync(join(tempDir, '2026', 'my-article.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].slug).toBe('my-article')
  })

  it('uses explicit slug from frontmatter when provided', async () => {
    const postWithSlug = VALID_POST.replace(
      'title: Test Post',
      'title: Test Post\nslug: custom-slug'
    )
    writeFileSync(join(tempDir, '2026', 'my-article.md'), postWithSlug)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].slug).toBe('custom-slug')
  })

  it('derives year from publishedAt, not directory name', async () => {
    writeFileSync(join(tempDir, '2026', 'test-post.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].year).toBe('2026')
  })

  it('converts tag strings to Tag objects', async () => {
    writeFileSync(join(tempDir, '2026', 'test-post.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].tags).toHaveLength(2)
    expect(posts[0].tags[0]).toMatchObject({ name: 'typescript', slug: 'typescript' })
    expect(posts[0].tags[1]).toMatchObject({ name: 'testing', slug: 'testing' })
  })

  it('sets tags to empty array when not in frontmatter', async () => {
    const postNoTags = VALID_POST.replace(/tags:\n  - typescript\n  - testing\n/, '')
    writeFileSync(join(tempDir, '2026', 'test-post.md'), postNoTags)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].tags).toEqual([])
  })

  it('calculates readingTime as a positive integer', async () => {
    writeFileSync(join(tempDir, '2026', 'test-post.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].readingTime).toBeGreaterThanOrEqual(1)
    expect(Number.isInteger(posts[0].readingTime)).toBe(true)
  })

  it('renders markdown content to HTML', async () => {
    writeFileSync(join(tempDir, '2026', 'test-post.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts[0].html).toContain('<h1')
    expect(posts[0].html).toContain('<strong>')
  })

  it('includes draft posts in development mode', async () => {
    writeFileSync(join(tempDir, '2026', 'draft-post.md'), DRAFT_POST)

    const posts = await loadAllPosts({ dir: tempDir, env: 'development' })

    expect(posts.some((p) => p.status === 'draft')).toBe(true)
  })

  it('excludes draft posts in production mode', async () => {
    writeFileSync(join(tempDir, '2026', 'draft-post.md'), DRAFT_POST)
    writeFileSync(join(tempDir, '2026', 'test-post.md'), VALID_POST)

    const posts = await loadAllPosts({ dir: tempDir, env: 'production' })

    expect(posts.every((p) => p.status === 'published')).toBe(true)
    expect(posts.some((p) => p.status === 'draft')).toBe(false)
  })

  it('returns empty array when directory is empty', async () => {
    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts).toEqual([])
  })

  it('returns empty array when directory does not exist', async () => {
    const posts = await loadAllPosts({ dir: '/nonexistent-dir-xyz' })

    expect(posts).toEqual([])
  })

  it('throws a descriptive error when required field title is missing', async () => {
    const noTitle = VALID_POST.replace('title: Test Post\n', '')
    writeFileSync(join(tempDir, '2026', 'test-post.md'), noTitle)

    await expect(loadAllPosts({ dir: tempDir })).rejects.toThrow(/title/)
  })

  it('throws a descriptive error when publishedAt is missing', async () => {
    const noDate = VALID_POST.replace('publishedAt: "2026-04-23T10:00:00+08:00"\n', '')
    writeFileSync(join(tempDir, '2026', 'test-post.md'), noDate)

    await expect(loadAllPosts({ dir: tempDir })).rejects.toThrow(/publishedAt/)
  })

  it('throws a descriptive error when status is missing', async () => {
    const noStatus = VALID_POST.replace('status: published\n', '')
    writeFileSync(join(tempDir, '2026', 'test-post.md'), noStatus)

    await expect(loadAllPosts({ dir: tempDir })).rejects.toThrow(/status/)
  })

  it('loads multiple posts sorted by publishedAt descending', async () => {
    const olderPost = VALID_POST.replace('2026-04-23T10:00:00+08:00', '2026-03-01T10:00:00+08:00')
    writeFileSync(join(tempDir, '2026', 'newer.md'), VALID_POST)
    mkdirSync(join(tempDir, '2026-older'), { recursive: true })
    writeFileSync(join(tempDir, '2026-older', 'older.md'), olderPost)

    const posts = await loadAllPosts({ dir: tempDir })

    expect(posts).toHaveLength(2)
    expect(new Date(posts[0].publishedAt) >= new Date(posts[1].publishedAt)).toBe(true)
  })
})
