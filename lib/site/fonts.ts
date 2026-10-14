import localFont from 'next/font/local'

export const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  preload: false,
  src: [
    { path: '../../assets/cv/fonts/satoshi/satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../../assets/cv/fonts/satoshi/satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../../assets/cv/fonts/satoshi/satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../../assets/cv/fonts/satoshi/satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
})
