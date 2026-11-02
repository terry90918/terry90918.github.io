import { afterAll, beforeAll, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

let directory: string
let server: ChildProcess
let origin: string

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'export-server-'))
  await mkdir(path.join(directory, 'article'))
  await writeFile(path.join(directory, 'article.html'), '<h1>Published article</h1>')
  await writeFile(path.join(directory, 'article', '__next.txt'), 'route data')
  await writeFile(path.join(directory, '404.html'), '<h1>Missing</h1>')
  await writeFile(path.join(directory, 'clip.mp4'), '0123456789')
  await writeFile(path.join(directory, 'rss.xml'), '<rss><channel /></rss>')
  server = spawn(process.execPath, ['scripts/serve-export.mjs', '--root', directory, '--port', '0'])
  origin = await new Promise<string>((resolve, reject) => {
    server.stdout!.on('data', (data) => {
      const match = String(data).match(/http:\/\/127\.0\.0\.1:\d+/)
      if (match) resolve(match[0])
    })
    server.once('error', reject)
    server.once('exit', (code) => reject(new Error(`Export server exited: ${code}`)))
  })
})

afterAll(async () => {
  if (server?.exitCode === null) {
    const stopped = new Promise((resolve) => server.once('exit', resolve))
    server.kill()
    await stopped
  }
  if (directory) await rm(directory, { recursive: true, force: true })
})

it('serves clean HTML routes before sibling route-data directories', async () => {
  const response = await fetch(`${origin}/article`)
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('text/html')
  expect(await response.text()).toBe('<h1>Published article</h1>')
  expect(await (await fetch(`${origin}/article/__next.txt`)).text()).toBe('route data')
})

it('returns a real 404 instead of serving the application for unknown routes', async () => {
  const response = await fetch(`${origin}/draft`)
  expect(response.status).toBe(404)
  expect(await response.text()).toBe('<h1>Missing</h1>')
})

it('serves RSS with the XML content type', async () => {
  const response = await fetch(`${origin}/rss.xml`)
  expect(response.headers.get('content-type')).toContain('xml')
  expect(await response.text()).toContain('<channel />')
})

it('serves partial media content and correct HEAD responses', async () => {
  const response = await fetch(`${origin}/clip.mp4`, { headers: { Range: 'bytes=3-6' } })
  expect(response.status).toBe(206)
  expect(response.headers.get('content-range')).toBe('bytes 3-6/10')
  expect(response.headers.get('content-type')).toBe('video/mp4')
  expect(await response.text()).toBe('3456')
  const head = await fetch(`${origin}/clip.mp4`, { method: 'HEAD' })
  expect(head.headers.get('content-length')).toBe('10')
  expect(await head.text()).toBe('')
  expect((await fetch(`${origin}/clip.mp4`, { headers: { Range: 'bytes=20-' } })).status).toBe(416)
})
