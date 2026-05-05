import { loadAllPosts } from './loader'
import type { Post, Tag, PostsByYearMonth } from './types'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export async function getPosts(): Promise<Post[]> {
  try {
    return await loadAllPosts()
  } catch {
    return []
  }
}

export async function getLatestPosts(count = 3): Promise<Post[]> {
  try {
    const posts = await loadAllPosts()
    return posts.slice(0, count)
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const posts = await loadAllPosts()
    return posts.find((p) => p.slug === slug) ?? null
  } catch {
    return null
  }
}

export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  try {
    const posts = await loadAllPosts()
    return posts.filter((p) => p.tags.some((t) => t.slug === tagSlug))
  } catch {
    return []
  }
}

export async function getAllPostSlugs(): Promise<{ year: string; slug: string }[]> {
  try {
    const posts = await loadAllPosts()
    return posts.map((p) => ({ year: p.year, slug: p.slug }))
  } catch {
    return []
  }
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const posts = await loadAllPosts()
    const tagMap = new Map<string, Tag>()
    for (const post of posts) {
      for (const tag of post.tags) {
        const existing = tagMap.get(tag.slug)
        if (existing) {
          tagMap.set(tag.slug, { ...existing, count: (existing.count ?? 0) + 1 })
        } else {
          tagMap.set(tag.slug, { ...tag, count: 1 })
        }
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

export async function getPostsByYearMonth(): Promise<PostsByYearMonth[]> {
  try {
    const posts = await getPosts()
    const grouped: Record<number, Record<number, Post[]>> = {}

    for (const post of posts) {
      const date = new Date(post.publishedAt)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      if (!grouped[year]) grouped[year] = {}
      if (!grouped[year][month]) grouped[year][month] = []
      grouped[year][month].push(post)
    }

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        months: Object.keys(grouped[year])
          .map(Number)
          .sort((a, b) => b - a)
          .map((month) => ({
            month,
            monthName: MONTHS[month - 1],
            posts: grouped[year][month],
          })),
      }))
  } catch {
    return []
  }
}

export async function getAdjacentPosts(
  currentSlug: string
): Promise<{ prev: Post | null; next: Post | null }> {
  try {
    const posts = await loadAllPosts()
    const idx = posts.findIndex((p) => p.slug === currentSlug)
    if (idx === -1) return { prev: null, next: null }
    return {
      prev: idx < posts.length - 1 ? posts[idx + 1] : null,
      next: idx > 0 ? posts[idx - 1] : null,
    }
  } catch {
    return { prev: null, next: null }
  }
}
