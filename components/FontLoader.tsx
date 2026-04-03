'use client'

import { useEffect } from 'react'

/**
 * Client-side font loader with optimized loading strategy
 * Uses the "print media trick" to prevent render-blocking
 */
export function FontLoader() {
  useEffect(() => {
    // Load LXGW WenKai TC font
    const lxgwLink = document.createElement('link')
    lxgwLink.rel = 'stylesheet'
    lxgwLink.href =
      'https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@300;400;700&display=swap'
    lxgwLink.media = 'print'
    lxgwLink.onload = () => {
      lxgwLink.media = 'all'
    }
    document.head.appendChild(lxgwLink)

    // Load Material Symbols font
    const symbolsLink = document.createElement('link')
    symbolsLink.rel = 'stylesheet'
    symbolsLink.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
    symbolsLink.media = 'print'
    symbolsLink.onload = () => {
      symbolsLink.media = 'all'
    }
    document.head.appendChild(symbolsLink)

    return () => {
      // Cleanup on unmount (though this rarely happens for root layout)
      document.head.removeChild(lxgwLink)
      document.head.removeChild(symbolsLink)
    }
  }, [])

  // Render noscript fallbacks for users without JavaScript
  return (
    <noscript>
      <link
        href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@300;400;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </noscript>
  )
}
