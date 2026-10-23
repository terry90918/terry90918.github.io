import type { FeaturePresentation } from './types'

function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid ${field}`)
  }
  return value as Record<string, unknown>
}

function mediaPath(value: unknown, field: string, pattern: RegExp): string {
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new Error(`Invalid ${field}`)
  }
  return value
}

export function readPresentation(value: unknown): FeaturePresentation | undefined {
  if (value === undefined) return undefined
  const input = record(value, 'presentation')
  if (input.type !== 'feature') throw new Error('Invalid presentation.type')
  const presentation: FeaturePresentation = { type: 'feature' }
  if (input.category !== undefined) {
    if (typeof input.category !== 'string' || !input.category.trim())
      throw new Error('Invalid presentation.category')
    presentation.category = input.category
  }
  if (input.audio !== undefined) {
    const audio = record(input.audio, 'presentation.audio')
    if (
      typeof audio.duration !== 'number' ||
      !Number.isFinite(audio.duration) ||
      audio.duration <= 0
    ) {
      throw new Error('Invalid presentation.audio.duration')
    }
    presentation.audio = {
      src: mediaPath(
        audio.src,
        'presentation.audio.src',
        /^\/audio\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.mp3$/
      ),
      duration: audio.duration,
    }
  }
  if (input.video !== undefined) {
    const video = record(input.video, 'presentation.video')
    if (typeof video.title !== 'string' || !video.title.trim()) {
      throw new Error('Invalid presentation.video.title')
    }
    presentation.video = {
      src: mediaPath(
        video.src,
        'presentation.video.src',
        /^\/videos\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.mp4$/
      ),
      poster: mediaPath(
        video.poster,
        'presentation.video.poster',
        /^\/videos\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(?:jpg|webp|png)$/
      ),
      title: video.title,
    }
  }
  return presentation
}
