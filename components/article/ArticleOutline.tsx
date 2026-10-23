'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import type { ArticleHeading } from '@/lib/posts/types'

export function ArticleOutline({
  headings,
  mobile = false,
}: {
  headings: ArticleHeading[]
  mobile?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(headings[0]?.id ?? '')
  useEffect(() => {
    let frame = 0
    function update() {
      let current = headings[0]?.id ?? ''
      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top <= 170) current = heading.id
      }
      setActive(current)
      frame = 0
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [headings])

  function followHeading(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return
    if (mobile) setOpen(false)
    const heading = document.getElementById(id)
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }

  const links = (
    <nav aria-label={mobile ? '行動版文章目錄' : '文章目錄'}>
      {!mobile && <p className="feature-outline-label">本篇內容</p>}
      <ul>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${encodeURIComponent(heading.id)}`}
              aria-current={active === heading.id ? 'location' : undefined}
              onClick={(event) => followHeading(event, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
  if (!mobile) return links
  return (
    <Collapsible className="feature-mobile-outline" open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="feature-outline-trigger">
          <span>文章目錄</span>
          <ChevronDown size={16} aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>{links}</CollapsibleContent>
    </Collapsible>
  )
}
