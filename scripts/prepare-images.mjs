import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve('public')
const destination = path.join(root, 'image-variants')
const manifest = {}

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return []
    throw error
  })
  const nested = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name)
      return entry.isDirectory()
        ? files(file)
        : entry.isFile() && /\.(webp|png|jpe?g)$/i.test(entry.name)
          ? [file]
          : []
    })
  )
  return nested.flat()
}

await mkdir(destination, { recursive: true })

for (const file of await files(path.join(root, 'images/ai-daily'))) {
  const input = await readFile(file)
  const { width, height } = await sharp(input).metadata()
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 20)
  const variants = []
  for (const size of [768, 1440].filter((size) => size < width)) {
    const name = `${hash}-${size}-q82.webp`
    const output = path.join(destination, name)
    if (
      !(await access(output).then(
        () => true,
        () => false
      ))
    ) {
      await sharp(input)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(output)
    }
    variants.push(`/image-variants/${name} ${size}w`)
  }
  manifest['/' + path.relative(root, file).split(path.sep).join('/')] = {
    width,
    height,
    srcSet: variants.join(', '),
  }
}

await writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest))
console.log(`Prepared responsive WebP choices for ${Object.keys(manifest).length} article images.`)
