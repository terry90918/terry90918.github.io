import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ArticleAudioBar } from '../../components/article/ArticleAudioBar'

let container: HTMLDivElement
let root: Root

beforeEach(async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () =>
    root.render(
      <ArticleAudioBar
        audio={{ src: '/audio/example.mp3', duration: 1092 }}
        url="https://example.com/article"
      />
    )
  )
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('does not reserve a status region when there is no message', () => {
  expect(container.querySelector('[role="status"]')).toBeNull()
})

it('offers a retry when playback is rejected instead of displaying a playing state', async () => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('unavailable'))
  const play = container.querySelector<HTMLButtonElement>('button[aria-label="播放播客"]')!
  await act(async () => play.click())
  expect(container.querySelector('[role="status"]')?.textContent).toBe('暫時無法播放，請再試一次。')
  expect(container.querySelector('button[aria-label="播放播客"]')).not.toBeNull()
  expect(container.querySelector('audio')?.getAttribute('controlslist')).toBe('nodownload')
})

it('reports copying only after the clipboard succeeds', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
  const share = container.querySelector<HTMLButtonElement>('button[aria-label="複製文章連結"]')!
  await act(async () => share.click())
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/article')
  expect(container.querySelector('[role="status"]')?.textContent).toBe('已複製連結')
})

it('does not report a playback failure when a pending play is cancelled', async () => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(
    new DOMException('cancelled', 'AbortError')
  )
  const play = container.querySelector<HTMLButtonElement>('button[aria-label="播放播客"]')!
  await act(async () => play.click())
  expect(container.textContent).not.toContain('暫時無法播放')
})

it('can recover from a failed media request on the next play attempt', async () => {
  let available = false
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {
    available = true
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() =>
    available ? Promise.resolve() : Promise.reject(new Error('failed media'))
  )
  const play = container.querySelector<HTMLButtonElement>('button[aria-label="播放播客"]')!
  await act(async () => play.click())
  expect(container.textContent).toContain('暫時無法播放')
  await act(async () => play.click())
  expect(container.textContent).not.toContain('暫時無法播放')
})

it('keeps the share button label stable while confirming success in the status message', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
  const share = container.querySelector<HTMLButtonElement>('button[aria-label="複製文章連結"]')!
  const label = share.textContent
  await act(async () => share.click())
  expect(share.textContent).toBe(label)
  expect(container.querySelector('[role="status"]')?.textContent).toBe('已複製連結')
})

it('uses shared buttons and an accessible slider for playback', () => {
  expect(container.querySelector('button[aria-label="播放播客"]')?.getAttribute('data-slot')).toBe(
    'button'
  )
  expect(container.querySelector('[role="slider"]')?.getAttribute('aria-label')).toBe(
    '播客播放進度'
  )
})

it('seeks by one second using the slider keyboard controls', async () => {
  const audio = container.querySelector('audio')!
  Object.defineProperty(audio, 'readyState', { configurable: true, value: 1 })
  await act(async () => audio.dispatchEvent(new Event('loadedmetadata')))
  const slider = container.querySelector<HTMLElement>('[role="slider"]')!
  await act(async () =>
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  )
  expect(audio.currentTime).toBe(1)
  expect(slider.getAttribute('aria-valuenow')).toBe('1')
})
