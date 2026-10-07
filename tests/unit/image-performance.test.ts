import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
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
    const rotated = await sharp({
      create: { width: 941, height: 1672, channels: 3, background: '#6688aa' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer()
    writeFileSync(path.join(images, 'rotated.jpg'), rotated)
    const destination = path.join(directory, 'public/image-variants')
    mkdirSync(destination, { recursive: true })
    const hash = createHash('sha256').update(rotated).digest('hex').slice(0, 20)
    await sharp(rotated)
      .resize({ width: 768 })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(destination, `${hash}-768-q82.webp`))
    const result = spawnSync(process.execPath, [path.resolve('scripts/prepare-images.mjs')], {
      cwd: directory,
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    const manifest = JSON.parse(
      readFileSync(path.join(directory, 'public/image-variants/manifest.json'), 'utf8')
    )
    for (const name of ['hero.webp', 'rotated.jpg']) {
      const image = manifest[`/images/ai-daily/example/${name}`]
      expect([image.width, image.height]).toEqual([1672, 941])
      expect(image.srcSet).toMatch(/768w, .*1440w$/)
      for (const entry of image.srcSet.split(', ')) {
        const [src, width] = entry.split(' ')
        const metadata = await sharp(path.join(directory, 'public', src)).metadata()
        expect(metadata.format).toBe('webp')
        expect(metadata.width).toBe(Number(width.slice(0, -1)))
        expect(metadata.height).toBe(Math.round((Number(width.slice(0, -1)) * 941) / 1672))
      }
    }
    expect(readFileSync(file)).toEqual(original)
    expect(readFileSync(path.join(images, 'rotated.jpg'))).toEqual(rotated)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
