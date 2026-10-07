import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { expect, it } from 'vitest'

it('prepares smaller WebP choices without changing canonical article images', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'image-performance-'))
  try {
    const images = path.join(directory, 'public/images/ai-daily/example')
    mkdirSync(images, { recursive: true })
    const original = await sharp({
      create: { width: 1672, height: 941, channels: 3, background: '#6688aa' },
    })
      .webp()
      .toBuffer()
    const file = path.join(images, 'hero.webp')
    writeFileSync(file, original)
    const result = spawnSync(process.execPath, [path.resolve('scripts/prepare-images.mjs')], {
      cwd: directory,
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    const manifest = JSON.parse(
      readFileSync(path.join(directory, 'public/image-variants/manifest.json'), 'utf8')
    )
    const image = manifest['/images/ai-daily/example/hero.webp']
    expect([image.width, image.height]).toEqual([1672, 941])
    expect(image.srcSet).toMatch(/768w, .*1440w$/)
    for (const entry of image.srcSet.split(', ')) {
      const [src, width] = entry.split(' ')
      const metadata = await sharp(path.join(directory, 'public', src)).metadata()
      expect(metadata.format).toBe('webp')
      expect(metadata.width).toBe(Number(width.slice(0, -1)))
    }
    expect(readFileSync(file)).toEqual(original)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
