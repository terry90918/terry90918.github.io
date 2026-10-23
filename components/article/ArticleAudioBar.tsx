'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useRef, useState } from 'react'
import { Check, LoaderCircle, Pause, Play, Share2 } from 'lucide-react'
import type { FeaturePresentation } from '@/lib/posts/types'

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

export function ArticleAudioBar({
  audio,
  url,
}: {
  audio?: FeaturePresentation['audio']
  url: string
}) {
  const player = useRef<HTMLAudioElement>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(audio?.duration ?? 0)
  const [error, setError] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [copying, setCopying] = useState(false)
  const message = error || shareStatus

  async function toggle() {
    const element = player.current
    if (!element) return
    if (error) {
      element.load()
      setReady(false)
    }
    setError('')
    if (!element.paused) {
      element.pause()
      return
    }
    setWaiting(true)
    try {
      await element.play()
    } catch (cause) {
      setPlaying(false)
      if (!(cause instanceof DOMException && cause.name === 'AbortError' && element.paused)) {
        setError('暫時無法播放，請再試一次。')
      }
    } finally {
      setWaiting(false)
    }
  }

  async function share() {
    setCopying(true)
    setShareStatus('')
    try {
      await navigator.clipboard.writeText(url)
      setShareStatus('已複製連結')
    } catch {
      setShareStatus('無法複製，請使用網址列分享。')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="feature-audio">
      <div className="feature-audio-row">
        {audio ? (
          <div className="feature-audio-playback">
            <audio
              ref={player}
              src={audio.src}
              preload="none"
              controlsList="nodownload"
              onPlay={() => setPlaying(true)}
              onPause={() => {
                setPlaying(false)
                setWaiting(false)
              }}
              onEnded={() => setPlaying(false)}
              onWaiting={() => setWaiting(true)}
              onPlaying={() => setWaiting(false)}
              onTimeUpdate={() => setElapsed(player.current?.currentTime ?? 0)}
              onLoadedMetadata={() => {
                setReady(true)
                const seconds = player.current?.duration
                if (seconds !== undefined && Number.isFinite(seconds)) setDuration(seconds)
              }}
              onError={() => {
                setPlaying(false)
                setWaiting(false)
                setError('暫時無法播放，請再試一次。')
              }}
            />
            <Button
              variant="ghost"
              type="button"
              className="feature-audio-toggle"
              onClick={toggle}
              aria-label={playing ? '暫停播客' : '播放播客'}
            >
              {waiting ? (
                <LoaderCircle size={16} className="feature-spin" />
              ) : playing ? (
                <Pause size={15} fill="currentColor" />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
            </Button>
            <span className="feature-audio-label">收聽播客</span>
            <span className="feature-audio-time">
              {elapsed > 0 ? `${clock(elapsed)} / ` : ''}
              {clock(duration)}
            </span>
          </div>
        ) : (
          <span className="feature-audio-label">分享這篇文章</span>
        )}
        <Button
          variant="ghost"
          type="button"
          className="feature-share"
          aria-label="複製文章連結"
          aria-busy={copying}
          disabled={copying}
          onClick={share}
        >
          {copying ? (
            <LoaderCircle size={16} className="feature-spin" />
          ) : shareStatus === '已複製連結' ? (
            <Check size={16} />
          ) : (
            <Share2 size={16} />
          )}
          <span>分享</span>
        </Button>
        {audio && (
          <Slider
            className="feature-audio-seek"
            aria-label="播客播放進度"
            aria-valuetext={`${clock(elapsed)} / ${clock(duration)}`}
            min={0}
            max={duration}
            step={1}
            disabled={!ready}
            value={[Math.min(elapsed, duration)]}
            onValueChange={([seconds]) => {
              if (seconds === undefined) return
              if (player.current && player.current.readyState > 0) {
                player.current.currentTime = seconds
                setElapsed(seconds)
              }
            }}
          />
        )}
      </div>
      {message && (
        <p className="feature-audio-status" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
