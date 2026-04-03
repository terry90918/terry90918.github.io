/**
 * Font Configuration using next/font
 *
 * Benefits:
 * - Self-hosted fonts (no external requests)
 * - Automatic font subsetting
 * - Zero layout shift
 * - Improved LCP (Largest Contentful Paint)
 */

import { Noto_Sans, Noto_Serif } from 'next/font/google'

/**
 * LXGW WenKai TC (霞鶩文楷) - Display Font
 * Note: next/font doesn't support LXGW WenKai TC yet,
 * keeping external link for now
 */

/**
 * Noto Sans TC - Body Font Fallback
 * Used as fallback when LXGW WenKai TC loads
 */
export const notoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
  weight: ['300', '400', '700'],
})

/**
 * Noto Serif TC - Display Font Fallback
 * Used for headings and emphasis
 */
export const notoSerif = Noto_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif',
  weight: ['300', '400', '700'],
})
