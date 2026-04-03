import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Staging 環境：禁止所有爬蟲
  if (process.env.STAGING === 'true') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // Production 環境：允許爬蟲
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://lawyer.jurislm.com/sitemap.xml',
  }
}
