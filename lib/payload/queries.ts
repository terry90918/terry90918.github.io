import { getPayload } from 'payload'
import config from '@payload-config'
import type { Article, Tag } from '@/payload-types'

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

async function getPayloadClient() {
  return getPayload({ config })
}

export async function getPosts(): Promise<Article[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      limit: 100,
      depth: 2,
    })
    return docs as unknown as Article[]
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Article | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
      depth: 2,
    })
    return (docs[0] as unknown as Article) ?? null
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
}): Promise<PaginatedResult<Article>> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'articles',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      page,
      limit,
      depth: 2,
    })

    return {
      data: result.docs as unknown as Article[],
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

export async function getPostsByTag(tagSlug: string): Promise<Article[]> {
  try {
    const payload = await getPayloadClient()

    // First find the tag by slug
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
      collection: 'articles',
      where: {
        status: { equals: 'published' },
        tags: { contains: tagId },
      },
      sort: '-publishedAt',
      limit: 1000,
      depth: 2,
    })

    return docs as unknown as Article[]
  } catch {
    return []
  }
}

export async function getLatestPosts(count = 3): Promise<Article[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      limit: count,
      depth: 2,
    })
    return docs as unknown as Article[]
  } catch {
    return []
  }
}

export async function getRelatedPosts(
  currentSlug: string,
  tagIds: (string | number)[],
  count = 3
): Promise<Article[]> {
  if (tagIds.length === 0) return []

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        status: { equals: 'published' },
        slug: { not_equals: currentSlug },
        tags: { in: tagIds },
      },
      sort: '-publishedAt',
      limit: count,
      depth: 2,
    })

    return docs as unknown as Article[]
  } catch {
    return []
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: {
        status: { equals: 'published' },
      },
      limit: 1000,
    })
    return (docs as unknown as Article[]).map((doc) => doc.slug)
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
