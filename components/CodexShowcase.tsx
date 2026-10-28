'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Locale } from '@/lib/cv/profile'
import snapshot from '@/lib/site/codex-activity.json'
import '@/styles/showcase.css'

const profileCopy = {
  'zh-TW': {
    title: 'OpenAI',
    stats: [
      ['1533.8 億', '累計 Token 數'],
      ['84.4 億', '單日最高 Token 數'],
      ['22 小時 57 分', '最長任務時間'],
      ['81 天', '最長連續紀錄'],
      ['81 天', '目前連續紀錄'],
    ],
    plugins: '熱門外掛程式',
    insights: '深入分析',
    rows: [
      ['快速模式', '0% 的執行使用快速模式'],
      ['最常用的推理', '中 · 33%'],
      ['已探索的技能', '295'],
      ['技能使用總次數', '15,487'],
    ],
  },
  en: {
    title: 'OpenAI',
    stats: [
      ['153.38B', 'Total tokens'],
      ['8.44B', 'Highest daily tokens'],
      ['22 h 57 min', 'Longest task'],
      ['81 days', 'Longest streak'],
      ['81 days', 'Current streak'],
    ],
    plugins: 'Top plugins',
    insights: 'Insights',
    rows: [
      ['Fast mode', '0% of runs use fast mode'],
      ['Most used reasoning', 'Medium · 33%'],
      ['Skills explored', '295'],
      ['Total skill uses', '15,487'],
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
    modes: { daily: '每日', weekly: '每週', cumulative: '累計' },
    views: '活動檢視',
    region: 'Token 活動圖，可水平捲動',
    chart: 'Token 活動，原頁色階快照，擷取日期',
    captured: '擷取日期',
    level: '色階',
    cells: '格',
    note: '色階表示來源圖的相對強度，不是逐日 Token 數值。',
    sourceNote: '保留來源圖表的實際色階，並非即時同步或逐日 Token 數值。',
    profile: '查看完整使用統計與工具紀錄',
  },
  en: {
    title: 'Token activity',
    modes: { daily: 'Daily', weekly: 'Weekly', cumulative: 'Cumulative' },
    views: 'Activity view',
    region: 'Token activity chart, horizontally scrollable',
    chart: 'token activity, captured source levels, capture date',
    captured: 'Captured',
    level: 'Level',
    cells: 'cells',
    note: 'Levels show relative intensity in the source chart, not daily token counts.',
    sourceNote: 'Captured source levels, not a live feed or daily token counts.',
    profile: 'View the full usage statistics and tool record',
  },
}

export function CodexActivity({
  locale = 'zh-TW',
  placement = 'work',
}: { locale?: Locale; placement?: 'work' | 'cv' } = {}) {
  const [mode, setMode] = useState<'daily' | 'weekly' | 'cumulative'>('daily')
  const copy = activityCopy[locale]
  const embedded = placement === 'cv'
  const sectionId = embedded ? 'cv-codex-activity' : 'codex-activity'
  const titleId = embedded ? 'cv-activity-title' : 'activity-title'
  const summaryId = embedded ? 'cv-activity-summary' : 'activity-summary'
  const Heading = embedded ? 'h4' : 'h2'
  const levels = [...snapshot[mode]]
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
        <Heading id={titleId}>{copy.title}</Heading>
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
      <div className="codex-chart-scroll" tabIndex={0} role="region" aria-label={copy.region}>
        <div
          className="codex-chart"
          role="img"
          aria-describedby={summaryId}
          aria-label={`${copy.modes[mode]} ${copy.chart} ${snapshot.capturedAt}`}
        >
          <div className="codex-chart-grid" data-activity-mode={mode}>
            {levels.map((level, index) => (
              <span key={index} data-activity-level={level} />
            ))}
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
        {copy.note}
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
        <h3 id="codex-profile-title">{copy.title}</h3>
        <p>
          Terry.TY Chen{' '}
          <a href={snapshot.source} target="_blank" rel="noopener noreferrer">
            @terrytychen ↗
          </a>
        </p>
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
      <div className="codex-plugins">
        <h4>{copy.plugins}</h4>
        <ul>
          {['Superpowers', 'Linear', 'dot', 'GitHub'].map((name, index) => (
            <li key={name} data-codex-plugin>
              <span className="codex-plugin-icon" aria-hidden="true">
                {name === 'Superpowers' ? (
                  <Image
                    src="/images/work/superpowers.svg"
                    alt=""
                    width={40}
                    height={40}
                    className="codex-superpowers-icon"
                  />
                ) : (
                  <span style={{ backgroundPositionX: `${-index * 72}px` }} />
                )}
              </span>
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="codex-insights">
        <h4>{copy.insights}</h4>
        <dl>
          {copy.rows.map(([label, value]) => (
            <div key={label} data-codex-insight>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
