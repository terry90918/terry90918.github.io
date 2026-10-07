import type { Metadata } from 'next'
import { profiles } from './profile'
import type { Locale } from './profile'
export const siteUrl = 'https://terry90918.github.io/cv'
export function pageMetadata(
  locale: Locale,
  route = '',
  title?: string,
  description?: string
): Metadata {
  const profile = profiles[locale]
  const pageTitle = title ? `${title} | ${profile.name}` : `${profile.name} | ${profile.role}`
  const summary = description ?? profile.description
  const url = `${siteUrl}/${locale}${route}`
  return {
    title: pageTitle,
    description: summary,
    metadataBase: new URL(siteUrl),
    icons: { icon: '/cv-assets/icon.svg' },
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': '/rss.xml' },
      languages: {
        'zh-TW': `${siteUrl}/zh-TW${route}`,
        en: `${siteUrl}/en${route}`,
        'x-default': `${siteUrl}/zh-TW${route}`,
      },
    },
    openGraph: {
      title: pageTitle,
      description: summary,
      url,
      type: 'website',
      siteName: profile.name,
      locale: locale === 'en' ? 'en_US' : 'zh_TW',
      images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: summary,
      images: [`${siteUrl}/og.png`],
    },
  }
}
