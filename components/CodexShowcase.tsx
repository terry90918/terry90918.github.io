'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ActivityChartCells } from '@/components/ActivityChartCells'
import type { Locale } from '@/lib/cv/profile'
import snapshot from '@/lib/site/codex-activity.json'
import {
  estimatedTotalTokens,
  illustrationDays,
  getIllustrationCells,
  type ActivityMode,
} from '@/lib/site/openai-illustration'
import '@/styles/showcase.css'

const profileCopy = {
  'zh-TW': {
    title: 'OpenAI',
    stats: [
      [`${estimatedTotalTokens / 1_000_000_000_000} 兆`, '推估累計 Token'],
      ['84.4 億', '單日最高 Token 數'],
      ['22 小時 57 分', '最長任務時間'],
      [`${illustrationDays} 天`, '模擬最長連續紀錄'],
      [`${illustrationDays} 天`, '模擬目前連續紀錄'],
    ],
  },
  en: {
    title: 'OpenAI',
    stats: [
      [`${estimatedTotalTokens / 1_000_000_000_000}T`, 'Estimated total tokens'],
      ['8.44B', 'Highest daily tokens'],
      ['22 h 57 min', 'Longest task'],
      [`${illustrationDays} days`, 'Simulated longest streak'],
      [`${illustrationDays} days`, 'Simulated current streak'],
    ],
  },
}

export function WorkGallery() {
  return (
    <div className="work-showcase-grid">
      {snapshot.works.map((work) => (
        <article key={work.slug} className="work-showcase-card">
          <a
            href={work.url}
            target="_blank"
            rel="noopener noreferrer"
            className="work-showcase-image"
          >
            <Image
              src={`/images/work/${work.slug}.jpg`}
              width={1200}
              height={750}
              alt={`${work.name}，作品預覽`}
              sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
            />
          </a>
          <div className="work-showcase-copy">
            <Badge variant="outline">{work.category}</Badge>
            <h3>
              <a href={work.url} target="_blank" rel="noopener noreferrer">
                {work.name}
              </a>
            </h3>
            <p>{work.summary}</p>
            {work.slug === 'ascii-sharks' && (
              <p className="work-showcase-note">
                動畫引擎：{' '}
                <a
                  href="https://github.com/stackedlol/ascii-sharks"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  stackedlol / ascii-sharks
                </a>
              </p>
            )}
            {work.note && <p className="work-showcase-note">{work.note}</p>}
            <Button asChild variant="outline">
              <a href={work.url} target="_blank" rel="noopener noreferrer">
                {work.action} ↗
              </a>
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}

const activityCopy = {
  'zh-TW': {
    title: 'Token 活動',
    illustrationTitle: 'Token 活動示意',
    illustrationNote:
      '模擬每日相對用量的示意圖；每週加總每日數值，累計加總至各週，不代表實際 Token 使用紀錄。',
    modes: { daily: '每日', weekly: '每週', cumulative: '累計' },
    views: '活動檢視',
    region: 'Token 活動圖，可水平捲動',
    chart: 'Token 活動，原頁色階快照，擷取日期',
    captured: '擷取日期',
    level: '色階',
    cells: '格',
    note: '色階表示來源圖的相對強度，不是逐日 Token 數值。',
    sourceNote: '保留來源圖表的實際色階，並非即時同步或逐日 Token 數值。',
    profile: '查看履歷中的使用規模推估',
  },
  en: {
    title: 'Token activity',
    illustrationTitle: 'Token activity illustration',
    illustrationNote:
      'An illustration of simulated daily relative usage; weekly totals sum daily values and cumulative totals sum through each week. Not actual token usage records.',
    modes: { daily: 'Daily', weekly: 'Weekly', cumulative: 'Cumulative' },
    views: 'Activity view',
    region: 'Token activity chart, horizontally scrollable',
    chart: 'token activity, captured source levels, capture date',
    captured: 'Captured',
    level: 'Level',
    cells: 'cells',
    note: 'Levels show relative intensity in the source chart, not daily token counts.',
    sourceNote: 'Captured source levels, not a live feed or daily token counts.',
    profile: 'View the usage estimate in the CV',
  },
}

export function CodexActivity({
  locale = 'zh-TW',
  placement = 'work',
}: { locale?: Locale; placement?: 'work' | 'cv' } = {}) {
  const [mode, setMode] = useState<ActivityMode>('daily')
  const copy = activityCopy[locale]
  const embedded = placement === 'cv'
  const sectionId = embedded ? 'cv-codex-activity' : 'codex-activity'
  const titleId = embedded ? 'cv-activity-title' : 'activity-title'
  const summaryId = embedded ? 'cv-activity-summary' : 'activity-summary'
  const Heading = embedded ? 'h3' : 'h2'
  const illustration = embedded ? getIllustrationCells(mode) : []
  const levels = embedded ? illustration.map((cell) => String(cell.level)) : [...snapshot[mode]]
  const distribution = [0, 1, 2, 3, 4]
    .map(
      (level) =>
        `${copy.level} ${level}: ${levels.filter((value) => value === String(level)).length} ${copy.cells}`
    )
    .join(locale === 'en' ? '; ' : '；')
  const total =
    locale === 'en'
      ? `${levels.length} cells; ${levels.filter((value) => value !== '0').length} have a non-zero level. `
      : `${levels.length} 個方格，${levels.filter((value) => value !== '0').length} 個為非零色階。`
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return (
    <section id={sectionId} className="codex-activity" aria-labelledby={titleId}>
      <div className="codex-section-header">
        <Heading id={titleId}>{embedded ? copy.illustrationTitle : copy.title}</Heading>
        <div className="codex-view-controls" role="group" aria-label={copy.views}>
          {(['daily', 'weekly', 'cumulative'] as const).map((value) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {copy.modes[value]}
            </Button>
          ))}
        </div>
      </div>
      <div
        className="codex-chart-scroll"
        tabIndex={embedded ? -1 : 0}
        role="region"
        aria-label={copy.region}
      >
        <div
          className="codex-chart"
          role={embedded ? 'group' : 'img'}
          aria-describedby={summaryId}
          aria-label={
            embedded
              ? `${copy.modes[mode]} ${copy.illustrationNote}`
              : `${copy.modes[mode]} ${copy.chart} ${snapshot.capturedAt}`
          }
        >
          <div
            className="codex-chart-grid"
            data-activity-mode={mode}
            data-activity-kind={embedded ? 'illustration' : 'snapshot'}
          >
            {embedded ? (
              <ActivityChartCells key={mode} cells={illustration} mode={mode} locale={locale} />
            ) : (
              levels.map((level, index) => <span key={index} data-activity-level={level} />)
            )}
          </div>
          <div className="codex-chart-months" aria-hidden="true">
            {snapshot.months.map((month) => (
              <span key={month}>{locale === 'en' ? months[month - 1] : `${month}月`}</span>
            ))}
          </div>
        </div>
      </div>
      <p id={summaryId} className="sr-only" aria-live="polite">
        {total}
        {distribution}
        {locale === 'en' ? '. ' : '。'}
        {embedded ? copy.illustrationNote : copy.note}
      </p>
      {!embedded && (
        <>
          <p className="codex-source">
            {copy.captured} <time dateTime={snapshot.capturedAt}>{snapshot.capturedAt}</time> ·{' '}
            <a href={snapshot.source} target="_blank" rel="noopener noreferrer">
              ChatGPT @terrytychen ↗
            </a>
          </p>
          <p className="codex-source">{copy.sourceNote}</p>
          <Link href={`/cv/${locale}#codex-profile`} className="site-text-link">
            {copy.profile}
          </Link>
        </>
      )}
    </section>
  )
}

export function CodexProfile({ locale }: { locale: Locale }) {
  const copy = profileCopy[locale]
  return (
    <section id="codex-profile" className="codex-profile" aria-labelledby="codex-profile-title">
      <header className="codex-profile-heading">
        <h2 id="codex-profile-title">{copy.title}</h2>
      </header>
      <dl className="codex-stat-strip">
        {copy.stats.map(([value, label]) => (
          <div key={label} data-codex-stat>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <CodexActivity locale={locale} placement="cv" />
    </section>
  )
}
