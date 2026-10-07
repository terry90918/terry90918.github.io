import { describe, expect, it } from 'vitest'
import { localeHref } from '@/lib/cv/profile'

describe('CV language links', () => {
  it.each([
    ['/cv', 'en', '', '/cv/en'],
    ['/cv/en/contact', 'zh-TW', '#contact-top', '/cv/zh-TW/contact#contact-top'],
    [
      '/cv/zh-TW/case-study/jurislm',
      'en',
      '#%E6%88%91%E7%9A%84%E8%A7%92%E8%89%B2',
      '/cv/en/case-study/jurislm#my-role',
    ],
    [
      '/cv/en/case-study/gj',
      'zh-TW',
      '#implementation-delivery',
      '/cv/zh-TW/case-study/gj#實作與交付',
    ],
  ] as const)(
    'switches %s to its corresponding page and anchor',
    (pathname, locale, hash, expected) => {
      expect(localeHref(pathname, locale, hash)).toBe(expected)
    }
  )
})
