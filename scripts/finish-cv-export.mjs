import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'

const files = ['cv.html', ...readdirSync('out/cv', { recursive: true }).map((file) => `cv/${file}`)]

for (const file of files.filter(
  (file) => file.endsWith('.html') && !file.endsWith('/index.html')
)) {
  const directory = path.join('out', file.slice(0, -5))
  mkdirSync(directory, { recursive: true })
  copyFileSync(path.join('out', file), path.join(directory, 'index.html'))
}
