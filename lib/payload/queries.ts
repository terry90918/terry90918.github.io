import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post, Tag } from '@/payload-types'

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    pages: number
    total: number
    next: number | null
    prev: number | null
  }
}

export interface PostsByYearMonth {
  year: number
  months: Array<{
    month: number
    monthName: string
    posts: Post[]
  }>
}

async function getPayloadClient() {
  return getPayload({ config })
}

export async function getPosts(): Promise<Post[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      limit: 100,
      depth: 2,
    })
    return docs as unknown as Post[]
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
      depth: 2,
    })
    return (docs[0] as unknown as Post) ?? null
  } catch {
    return null
  }
}

export async function getPostsPaginated({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
}): Promise<PaginatedResult<Post>> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      page,
      limit,
      depth: 2,
    })

    return {
      data: result.docs as unknown as Post[],
      pagination: {
        page: result.page ?? page,
        limit: result.limit ?? limit,
        pages: result.totalPages ?? 1,
        total: result.totalDocs ?? result.docs.length,
        next: result.nextPage ?? null,
        prev: result.prevPage ?? null,
      },
    }
  } catch {
    return {
      data: [],
      pagination: { page, limit, pages: 0, total: 0, next: null, prev: null },
    }
  }
}

export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  try {
    const payload = await getPayloadClient()

    const { docs: tags } = await payload.find({
      collection: 'tags',
      where: {
        slug: { equals: tagSlug },
      },
      limit: 1,
    })

    if (tags.length === 0) return []

    const tagId = tags[0].id

    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
        tags: { contains: tagId },
      },
      sort: '-publishedAt',
      limit: 1000,
      depth: 2,
    })

    return docs as unknown as Post[]
  } catch {
    return []
  }
}

export async function getLatestPosts(count = 3): Promise<Post[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      limit: count,
      depth: 2,
    })
    return docs as unknown as Post[]
  } catch {
    return []
  }
}

export async function getRelatedPosts(
  currentSlug: string,
  tagIds: (string | number)[],
  count = 3
): Promise<Post[]> {
  if (tagIds.length === 0) return []

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
        slug: { not_equals: currentSlug },
        tags: { in: tagIds },
      },
      sort: '-publishedAt',
      limit: count,
      depth: 2,
    })

    return docs as unknown as Post[]
  } catch {
    return []
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      limit: 1000,
    })
    return (docs as unknown as Post[]).map((doc) => doc.slug)
  } catch {
    return []
  }
}

export async function getAllTags(): Promise<{ slug: string; name: string }[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'tags',
      limit: 100,
      sort: 'name',
    })
    return (docs as unknown as Tag[]).map((tag) => ({
      slug: tag.slug,
      name: tag.name,
    }))
  } catch {
    return []
  }
}

/**
 * Returns all published posts grouped by year and month for the /posts listing page.
 */
export async function getPostsByYearMonth(): Promise<PostsByYearMonth[]> {
  try {
    const posts = await getPosts()

    const grouped: Record<number, Record<number, Post[]>> = {}

    for (const post of posts) {
      if (!post.publishedAt) continue
      const date = new Date(post.publishedAt)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      if (!grouped[year]) grouped[year] = {}
      if (!grouped[year][month]) grouped[year][month] = []
      grouped[year][month].push(post)
    }

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
    const posts = await getPosts()
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
