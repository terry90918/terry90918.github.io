import { MetadataRoute } from 'next'
import { getAllPostSlugs } from '@/lib/payload/queries'

const baseUrl = 'https://blog.jurislm.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPostSlugs()

  const postEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/posts/${new Date().getFullYear()}/${slug}`,
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
