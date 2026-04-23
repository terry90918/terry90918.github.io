import { readdir, readFile } from 'fs/promises'
import { join, basename, extname } from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { renderMarkdown } from './markdown'
import { slugify } from './slugify'
import type { Post, Tag } from './types'

interface LoadOptions {
  dir?: string
  env?: string
}

let cache: Post[] | null = null

async function scanMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[]
  try {
    entries = await readdir(dir, { withFileTypes: true, encoding: 'utf8' })
  } catch {
    return []
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      const nested = await scanMarkdownFiles(fullPath)
      files.push(...nested)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function validateFrontmatter(data: Record<string, unknown>, filePath: string): void {
  if (!data.title) {
    throw new Error(`Missing required frontmatter field "title" in ${filePath}`)
  }
  if (!data.publishedAt) {
    throw new Error(`Missing required frontmatter field "publishedAt" in ${filePath}`)
  }
  if (!data.status) {
    throw new Error(`Missing required frontmatter field "status" in ${filePath}`)
  }
}

async function parsePost(filePath: string): Promise<Post> {
  const raw = await readFile(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const fm = data as Record<string, unknown>

  validateFrontmatter(fm, filePath)

  const filename = basename(filePath, extname(filePath))
  const slug = typeof fm.slug === 'string' && fm.slug ? fm.slug : filename
  const publishedAt = String(fm.publishedAt)
  const year = new Date(publishedAt).getFullYear().toString()

  const tagStrings: string[] = Array.isArray(fm.tags) ? (fm.tags as string[]) : []
  const tags: Tag[] = tagStrings.map((t) => ({ name: t, slug: slugify(t) }))

  const rtResult = readingTime(content)
  const readingTimeMinutes = Math.max(1, Math.ceil(rtResult.minutes))

  const html = await renderMarkdown(content)

  return {
    title: String(fm.title),
    slug,
    excerpt: typeof fm.excerpt === 'string' ? fm.excerpt : '',
    publishedAt,
    status: fm.status === 'published' ? 'published' : 'draft',
    tags,
    readingTime: readingTimeMinutes,
    html,
    rawContent: content,
    year,
    metaDescription: typeof fm.metaDescription === 'string' ? fm.metaDescription : undefined,
    featureImage: typeof fm.featureImage === 'string' ? fm.featureImage : undefined,
  }
}

export async function loadAllPosts(opts: LoadOptions = {}): Promise<Post[]> {
  const postsDir = opts.dir ?? join(process.cwd(), 'content/posts')
  const env = opts.env ?? process.env.NODE_ENV ?? 'development'
  const isProd = env === 'production'

  if (isProd && !opts.dir && cache) return cache

  const filePaths = await scanMarkdownFiles(postsDir)
  const posts = await Promise.all(filePaths.map((fp) => parsePost(fp)))

  const filtered = isProd ? posts.filter((p) => p.status === 'published') : posts

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  if (isProd && !opts.dir) cache = sorted
  return sorted
}

export function clearCache(): void {
  cache = null
}
