export interface Tag {
  name: string
  slug: string
  count?: number
}

export interface PostFrontmatter {
  title: string
  slug?: string
  excerpt?: string
  publishedAt: string
  status: 'draft' | 'published'
  tags?: string[]
  metaDescription?: string
  featureImage?: string
}

export interface Post {
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  status: 'draft' | 'published'
  tags: Tag[]
  readingTime: number
  html: string
  rawContent: string
  year: string
  metaDescription?: string
  featureImage?: string
}

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
