import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  options: { root: { type: 'string', default: 'out' }, port: { type: 'string', default: '3001' } },
})
const root = path.resolve(values.root)
const port = Number(values.port)
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port')
const notFound = await stat(path.join(root, '404.html')).catch((error) => {
  if (['ENOENT', 'ENOTDIR'].includes(error.code)) return null
  throw error
})
if (!notFound?.isFile()) throw new Error('Build the site first')
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
}

async function findFile(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname)
  const file = path.resolve(root, `.${pathname}`)
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) return null
  for (const candidate of [
    file,
    `${file.replace(/\/$/, '')}.html`,
    path.join(file, 'index.html'),
  ]) {
    if (!candidate.startsWith(`${root}${path.sep}`)) continue
    try {
      const metadata = await stat(candidate)
      if (metadata.isFile()) return { file: candidate, size: metadata.size }
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error
    }
  }
  return null
}

const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    const found = await findFile(request.url)
    const file = found?.file ?? path.join(root, '404.html')
    const size = found?.size ?? (await stat(file)).size
    const headers = {
      'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      'Content-Length': size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    }
    let start = 0
    let end = size - 1
    let status = found ? 200 : 404
    if (found && request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range)
      start = range?.[1] ? Number(range[1]) : Math.max(0, size - Number(range?.[2]))
      end = range?.[1] && range?.[2] ? Math.min(size - 1, Number(range[2])) : size - 1
      if (!range || (!range[1] && !range[2]) || start > end || start >= size) {
        response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end()
        return
      }
      status = 206
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`
      headers['Content-Length'] = end - start + 1
    }
    response.writeHead(status, headers)
    if (request.method === 'HEAD' || size === 0) response.end()
    else {
      const stream = createReadStream(file, { start, end })
      stream.on('error', () => response.destroy())
      response.on('close', () => stream.destroy())
      stream.pipe(response)
    }
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 500).end()
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${server.address().port}`)
})
