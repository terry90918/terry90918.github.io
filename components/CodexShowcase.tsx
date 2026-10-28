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
    title: 'Codex 使用紀錄',
    source: '資料來源',
    captured: '擷取日期',
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
    note: 'ChatGPT 個人頁的統計快照；技能數量指 Codex skills。連續紀錄以擷取當日為準。',
    activity: '查看完整 Token 活動圖',
  },
  en: {
    title: 'Codex usage record',
    source: 'Source',
    captured: 'Captured',
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
    note: 'A snapshot of the ChatGPT profile. Skills refers to Codex skills. Streaks are as of the capture date.',
    activity: 'View the full token activity chart',
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

export function CodexActivity() {
  const [mode, setMode] = useState<'daily' | 'weekly' | 'cumulative'>('daily')
  return (
    <section id="codex-activity" className="codex-activity" aria-labelledby="activity-title">
      <div className="codex-section-header">
        <h2 id="activity-title">Token 活動</h2>
        <div className="codex-view-controls" role="group" aria-label="活動檢視">
          {(
            [
              ['daily', '每日'],
              ['weekly', '每週'],
              ['cumulative', '累計'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div
        className="codex-chart-scroll"
        tabIndex={0}
        role="region"
        aria-label="Token 活動圖，可水平捲動"
      >
        <div
          className="codex-chart"
          role="img"
          aria-label={`${{ daily: '每日', weekly: '每週', cumulative: '累計' }[mode]} Token 活動，原頁色階快照，擷取日期 ${snapshot.capturedAt}`}
        >
          <div className="codex-chart-grid">
            {[...snapshot[mode]].map((level, index) => (
              <span key={index} data-activity-level={level} />
            ))}
          </div>
          <div className="codex-chart-months" aria-hidden="true">
            {snapshot.months.map((month) => (
              <span key={month}>{month}月</span>
            ))}
          </div>
        </div>
      </div>
      <p className="codex-source">
        擷取日期 <time dateTime={snapshot.capturedAt}>{snapshot.capturedAt}</time> ·{' '}
        <a href={snapshot.source} target="_blank" rel="noopener noreferrer">
          ChatGPT @terrytychen ↗
        </a>
      </p>
      <p className="codex-source">保留來源圖表的實際色階，並非即時同步或逐日 Token 數值。</p>
      <Link href="/cv/zh-TW#codex-profile" className="site-text-link">
        查看完整使用統計與工具紀錄
      </Link>
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
      <div className="codex-plugins">
        <h4>{copy.plugins}</h4>
        <ul>
          {['Superpowers', 'Linear', 'dot', 'GitHub'].map((name, index) => (
            <li key={name} data-codex-plugin>
              <span className="codex-plugin-icon" aria-hidden="true">
                <span style={{ backgroundPositionX: `${-index * 72}px` }} />
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
      <p className="codex-source">
        {copy.captured} <time dateTime={snapshot.capturedAt}>{snapshot.capturedAt}</time> ·{' '}
        {copy.source}{' '}
        <a href={snapshot.source} target="_blank" rel="noopener noreferrer">
          ChatGPT @terrytychen ↗
        </a>
      </p>
      <p className="codex-source">{copy.note}</p>
      <Link href="/work#codex-activity" className="site-text-link">
        {copy.activity}
      </Link>
    </section>
  )
}
