'use client'

import { useState, useEffect } from 'react'

/**
 * 以 requestAnimationFrame 節流的方式監聽 window.scrollY
 * 回傳目前的垂直捲動位置
 */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false

    function handleScroll(): void {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}
