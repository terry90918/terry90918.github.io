#!/usr/bin/env bun
/**
 * Generate a two-host podcast (dialogue script + TTS + mixdown) for a post and
 * embed the <audio> tag, following the manual pipeline established in PR #14/#21.
 *
 * Usage:
 *   OPENAI_API_KEY=... bun scripts/generate-podcast.ts <slug-or-path> [--script <dialogue.json>] [--dry-run]
 *
 * Without --script, the dialogue is drafted by shelling out to the `claude` CLI
 * (same approach as scripts/convert-skills/convert.ts). Pass --script to skip
 * that step and supply a pre-written dialogue JSON instead — an array of
 * { "speaker": "A" | "B", "text": "..." } turns.
 */
import { spawnSync } from 'child_process'
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  readdirSync,
} from 'fs'
import { join, basename, resolve, relative } from 'path'
import { tmpdir } from 'os'
import matter from 'gray-matter'

const CONTENT_ROOT = join(import.meta.dir, '../content/posts')
const AUDIO_ROOT = join(import.meta.dir, '../public/audio')
const TTS_MODEL = 'gpt-4o-mini-tts'

const VOICES: Record<'A' | 'B', string> = { A: 'marin', B: 'cedar' }
const SPEAKER_INSTRUCTIONS: Record<'A' | 'B', string> = {
  A: '用好奇、輕快、略帶興奮的語氣念，像在對談中主動拋出問題。',
  B: '用沉穩、條理清晰、略帶低沉的語氣念，像是在深入解析重點。',
}

interface DialogueTurn {
  speaker: 'A' | 'B'
  text: string
}

function findPostPath(input: string): string {
  if (input.endsWith('.md') && existsSync(input)) return resolve(input)

  const years = readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)

  for (const year of years) {
    const candidate = join(CONTENT_ROOT, year, `${input}.md`)
    if (existsSync(candidate)) return candidate
  }

  throw new Error(`Could not find a post for "${input}" under ${CONTENT_ROOT}`)
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  return (fenced ? fenced[1] : raw).trim()
}

function isValidTurn(turn: unknown): turn is DialogueTurn {
  if (typeof turn !== 'object' || turn === null) return false
  const { speaker, text } = turn as Record<string, unknown>
  return (speaker === 'A' || speaker === 'B') && typeof text === 'string' && text.length > 0
}

function validateTurns(value: unknown): DialogueTurn[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Dialogue script must be a non-empty JSON array')
  }
  for (const turn of value) {
    if (!isValidTurn(turn)) {
      throw new Error(`Invalid dialogue turn: ${JSON.stringify(turn)}`)
    }
  }
  return value as DialogueTurn[]
}

function generateDialogueScript(title: string, body: string): DialogueTurn[] {
  const prompt = `你是 Podcast 腳本編劇。請把以下文章改寫成兩位主持人（甲＝speaker "A"，乙＝speaker "B"）之間口語、自然、有來有往的繁體中文對話，風格類似 NotebookLM 的「深度探討」：主持人會互相補充、提出疑問、適度表達驚訝或追問，可以用簡短的口語詞（例如「對啊」「欸」「這樣喔」）讓對話自然，但不要加任何虛構的人設或姓名。開頭要有簡短開場白，結尾要有簡短總結。

只輸出 JSON，不要輸出其他文字、不要用 markdown code fence。格式為陣列，每個元素是 {"speaker": "A" 或 "B", "text": "這句台詞"}。

文章標題：${title}

文章內容：
${body}`

  const result = spawnSync(
    'claude',
    ['--model', 'sonnet', '--max-turns', '3', '--print', '--allowedTools', '', '-p', prompt],
    {
      env: { ...process.env, ECC_SKIP_OBSERVE: '1' },
      timeout: 180_000,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }
  )

  if (result.error) {
    throw new Error(`claude CLI error: ${result.error.message}`)
  }
  if (result.status !== 0) {
    throw new Error(`claude CLI exited with ${result.status}: ${result.stderr}`)
  }

  const jsonText = extractJson((result.stdout ?? '').trim())
  return validateTurns(JSON.parse(jsonText))
}

async function synthesizeTurn(turn: DialogueTurn, outPath: string, apiKey: string): Promise<void> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      voice: VOICES[turn.speaker],
      input: turn.text,
      instructions: SPEAKER_INSTRUCTIONS[turn.speaker],
      response_format: 'mp3',
    }),
  })

  if (!res.ok) {
    throw new Error(`TTS request failed (${res.status}): ${await res.text()}`)
  }

  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()))
}

function concatAndDownsample(segmentPaths: string[], outPath: string, listPath: string): void {
  const list = segmentPaths.map((p) => `file '${p}'`).join('\n')
  writeFileSync(listPath, list, 'utf8')

  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-codec:a',
      'libmp3lame',
      '-b:a',
      '80k',
      '-ac',
      '1',
      outPath,
    ],
    { encoding: 'utf8' }
  )

  if (result.error) {
    throw new Error(`ffmpeg error: ${result.error.message}`)
  }
  if (result.status !== 0) {
    throw new Error(`ffmpeg exited with ${result.status}: ${result.stderr}`)
  }
}

function embedAudioTag(postPath: string, year: string, slug: string): void {
  const raw = readFileSync(postPath, 'utf8')
  if (raw.includes('<audio')) {
    console.log('[SKIP] post already has an <audio> tag')
    return
  }

  const frontmatterMatch = raw.match(/^---\n[\s\S]*?\n---\n/)
  if (!frontmatterMatch) {
    throw new Error(`Could not find a frontmatter block in ${postPath}`)
  }

  const frontmatterBlock = frontmatterMatch[0]
  const body = raw.slice(frontmatterBlock.length)
  const snippet = `\n<audio controls preload="none" style="width: 100%;">\n  <source src="/audio/${year}/${slug}.mp3" type="audio/mpeg">\n  您的瀏覽器不支援音訊播放，請<a href="/audio/${year}/${slug}.mp3">直接下載收聽</a>。\n</audio>\n`

  writeFileSync(postPath, frontmatterBlock + snippet + body, 'utf8')
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const scriptIdx = args.indexOf('--script')
  const scriptPath = scriptIdx !== -1 ? args[scriptIdx + 1] : null
  const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--script')
  const target = positional[0]

  if (!target) {
    console.error(
      'Usage: bun scripts/generate-podcast.ts <slug-or-path> [--script <dialogue.json>] [--dry-run]'
    )
    process.exit(1)
  }

  const postPath = findPostPath(target)
  const raw = readFileSync(postPath, 'utf8')
  const { data, content } = matter(raw)

  const filename = basename(postPath, '.md')
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : filename
  const year = new Date(String(data.publishedAt)).getFullYear().toString()
  const title = String(data.title ?? filename)

  console.log(`Post: ${postPath}`)
  console.log(`Slug: ${slug}, Year: ${year}`)

  let turns: DialogueTurn[]
  if (scriptPath) {
    turns = validateTurns(JSON.parse(readFileSync(scriptPath, 'utf8')))
  } else {
    console.log('Drafting dialogue script via claude CLI...')
    turns = generateDialogueScript(title, content)
  }

  console.log(`Dialogue turns: ${turns.length}`)

  if (dryRun) {
    console.log(JSON.stringify(turns, null, 2))
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY environment variable')
    process.exit(1)
  }

  const tmp = mkdtempSync(join(tmpdir(), 'podcast-'))
  try {
    const segmentPaths: string[] = []
    for (let i = 0; i < turns.length; i++) {
      const segPath = join(tmp, `seg-${String(i).padStart(3, '0')}.mp3`)
      await synthesizeTurn(turns[i], segPath, apiKey)
      segmentPaths.push(segPath)
      console.log(`[TTS] ${i + 1}/${turns.length}`)
    }

    const audioDir = join(AUDIO_ROOT, year)
    mkdirSync(audioDir, { recursive: true })
    const outPath = join(audioDir, `${slug}.mp3`)

    const relOut = relative(resolve(AUDIO_ROOT), resolve(outPath))
    if (relOut.startsWith('..')) {
      throw new Error(`Output path escapes ${AUDIO_ROOT}: ${outPath}`)
    }

    concatAndDownsample(segmentPaths, outPath, join(tmp, 'list.txt'))
    console.log(`[OK] wrote ${outPath}`)

    embedAudioTag(postPath, year, slug)
    console.log(`[OK] embedded <audio> tag in ${postPath}`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

main()
