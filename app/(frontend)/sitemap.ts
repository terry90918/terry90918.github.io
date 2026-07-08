import { MetadataRoute } from 'next'
import { getAllPostSlugs } from '@/lib/posts/queries'

export const dynamic = 'force-static'

const baseUrl = 'https://terry90918.github.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPostSlugs()

  const postEntries: MetadataRoute.Sitemap = slugs.map(({ year, slug }) => ({
    url: `${baseUrl}/posts/${year}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...postEntries,
  ]
}
