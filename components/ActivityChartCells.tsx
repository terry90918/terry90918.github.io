'use client'

import { useState, type HTMLAttributes, type KeyboardEvent } from 'react'
import { Tooltip } from 'radix-ui'
import type { Locale } from '@/lib/cv/profile'
import {
  formatActivityTooltip,
  type ActivityMode,
  type getIllustrationCells,
} from '@/lib/site/openai-illustration'

type ActivityCell = ReturnType<typeof getIllustrationCells>[number]

export function ActivityChartCells({
  cells,
  mode,
  locale,
}: {
  cells: ActivityCell[]
  mode: ActivityMode
  locale: Locale
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const daily = mode === 'daily'
  const groups = daily
    ? cells.map((cell) => [cell])
    : Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7))
  const moveFocus = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const offsets: Record<string, number> = {
      ArrowRight: daily ? 7 : 1,
      ArrowLeft: daily ? -7 : -1,
      ArrowDown: 1,
      ArrowUp: -1,
    }
    const offset = offsets[event.key]
    if (offset === undefined && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? groups.length - 1
          : Math.max(0, Math.min(groups.length - 1, index + offset))
    const targets = event.currentTarget
      .closest('[data-activity-mode]')
      ?.querySelectorAll<HTMLElement>('[data-activity-trigger]')
    targets?.[next]?.focus()
  }
  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={300} disableHoverableContent>
      {groups.map((group, index) => {
        const cell = group[0]
        const { dateLabel, tokenLabel } = formatActivityTooltip({ ...cell, mode, locale })
        const triggerProps: HTMLAttributes<HTMLElement> & { 'data-activity-trigger': string } = {
          'data-activity-trigger': String(index),
          role: 'img',
          'aria-label': dateLabel,
          tabIndex: activeIndex === index ? 0 : -1,
          onFocus: () => setActiveIndex(index),
          onKeyDown: (event) => moveFocus(event, index),
        }
        return (
          <Tooltip.Root key={cell.date}>
            <Tooltip.Trigger asChild>
              {daily ? (
                <span
                  {...triggerProps}
                  data-activity-level={cell.level}
                  data-activity-month={cell.month}
                  style={{ backgroundColor: cell.color }}
                />
              ) : (
                <div {...triggerProps} className="codex-chart-column">
                  {group.map((item, row) => (
                    <span
                      key={row}
                      data-activity-level={item.level}
                      data-activity-month={item.month}
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </div>
              )}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="codex-activity-tooltip"
                side="top"
                sideOffset={4}
                collisionPadding={8}
                hideWhenDetached
              >
                <span>{dateLabel}</span>
                <span>{tokenLabel}</span>
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )
      })}
    </Tooltip.Provider>
  )
}
