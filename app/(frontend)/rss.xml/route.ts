import { NextResponse } from 'next/server'
import { getPosts } from '@/lib/payload/queries'
import { buildRssFeed } from '@/lib/rss'

export const revalidate = 3600

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terry90918.dev'
  const posts = await getPosts()
  const xml = buildRssFeed(posts, siteUrl)

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
