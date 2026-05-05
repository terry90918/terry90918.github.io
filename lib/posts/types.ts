export interface Tag {
  name: string
  slug: string
  count?: number
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

export interface PostsByYearMonth {
  year: number
  months: Array<{
    month: number
    monthName: string
    posts: Post[]
  }>
}
