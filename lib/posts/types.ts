export interface Tag {
  name: string
  slug: string
  count?: number
}

export interface ArticleHeading {
  id: string
  text: string
}

export interface FeaturePresentation {
  type: 'feature'
  category?: string
  audio?: { src: string; duration: number }
  video?: { src: string; poster: string; title: string }
}

interface PostFields {
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  tags: Tag[]
  readingTime: number
  html: string
  rawContent: string
  year: string
  metaDescription?: string
  featureImage?: string
  presentation?: FeaturePresentation
  outline?: ArticleHeading[]
}

export interface PublishedPost extends PostFields {
  status: 'published'
  canonicalSlug?: never
}

export interface DraftPost extends PostFields {
  status: 'draft'
  canonicalSlug?: never
}

export interface AliasPost extends PostFields {
  status: 'alias'
  canonicalSlug: string
}

export type Post = PublishedPost | DraftPost | AliasPost

export interface PostsByYearMonth {
  year: number
  months: Array<{
    month: number
    monthName: string
    posts: Post[]
  }>
}
