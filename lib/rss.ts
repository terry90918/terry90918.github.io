interface RssPost {
  id?: number | string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
}

/**
 * Builds an RSS 2.0 XML feed from a list of posts.
 */
export function buildRssFeed(posts: RssPost[], siteUrl: string): string {
  const items = posts
    .map((post) => {
      const link = `${siteUrl}/posts/${post.slug}`
      const pubDate = post.publishedAt
        ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`
        : ''
      const description = post.excerpt
        ? `<description>${escapeXml(post.excerpt)}</description>`
        : '<description></description>'

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      ${description}
      ${pubDate}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Terry Chen</title>
    <link>${siteUrl}</link>
    <description>Building AI agent systems and MCP tooling in Taiwan.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
