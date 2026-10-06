import type { MetadataRoute } from 'next'
import { getPosts } from '@/lib/posts/queries'
import { WORK_CASES } from '@/lib/site/content'
import { getPostHref } from '@/lib/site/writing'

export const dynamic = 'force-static'
const baseUrl = 'https://terry90918.github.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getPosts()).filter((post) => post.status === 'published')
  const paths = [
    '/',
    '/about',
    '/story',
    '/work',
    '/posts',
    '/posts/ai-daily',
    ...WORK_CASES.map((work) => `/work/${work.slug}`),
  ]
  return [
    ...paths.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}${getPostHref(post)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
