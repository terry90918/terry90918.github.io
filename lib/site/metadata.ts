import type { Metadata } from 'next'

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `https://terry90918.github.io${path}`
  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: 'zh_TW',
      type: 'website',
      siteName: 'Terry Chen',
    },
    twitter: { card: 'summary', title, description },
  }
}
