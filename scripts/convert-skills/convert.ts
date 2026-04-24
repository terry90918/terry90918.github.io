#!/usr/bin/env bun
import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'

const MAPPING_PATH = join(import.meta.dir, 'mapping.json')
const CONTENT_BASE = join(import.meta.dir, '../../content/posts/2026')
const ALLOWED_OUTPUT_PREFIX = join(import.meta.dir, '../../content/posts/2026/')

interface MappingEntry {
  sourcePath: string
  publishedAt: string
  title: string
  slug: string
  tags: string[]
}

function assertOutputPath(outPath: string): void {
  const resolved = outPath.startsWith(ALLOWED_OUTPUT_PREFIX)
  if (!resolved) {
    throw new Error(`Output path escapes allowed directory: ${outPath}`)
  }
}

function resolveSourcePath(p: string): string {
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p
}

function buildFrontmatter(entry: MappingEntry): string {
  const tagsYaml = entry.tags.map((t) => `  - ${t}`).join('\n')
  return `---
title: '${entry.title.replace(/'/g, "''")}'
publishedAt: '${entry.publishedAt}'
status: 'draft'
slug: '${entry.slug}'
tags:
${tagsYaml}
---`
}

function translateWithClaude(sourceContent: string, title: string): string {
  const prompt = `你是一位技術部落格作者。請將以下工程師學習筆記翻譯成繁體中文部落格文章。

要求：
- 輸出繁體中文
- 保留技術術語（如 TypeScript、Docker、Next.js 等）的英文原文
- 將筆記格式（Problem/Solution/Example/When to Use）改寫成自然流暢的部落格文章
- 文章標題已定為：${title}
- 不要輸出 frontmatter，只輸出文章本文（Markdown 格式）
- 開頭不要重複標題，直接進入內容

原始學習筆記：
${sourceContent}`

  const result = spawnSync(
    'claude',
    ['--model', 'haiku', '--max-turns', '3', '--print', '--allowedTools', '', '-p', prompt],
    {
      env: { ...process.env, ECC_SKIP_OBSERVE: '1' },
      timeout: 120_000,
      encoding: 'utf8',
    }
  )

  if (result.error) {
    throw new Error(`claude CLI error: ${result.error.message}`)
  }
  if (result.status !== 0) {
    throw new Error(`claude CLI exited with ${result.status}: ${result.stderr}`)
  }

  return (result.stdout ?? '').trim()
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const force = args.includes('--force')
  const onlyIdx = args.indexOf('--only')
  const onlySlug = onlyIdx !== -1 ? args[onlyIdx + 1] : null

  const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf8')) as Record<string, MappingEntry>
  const entries = Object.values(mapping)

  const targets = onlySlug ? entries.filter((e) => e.slug === onlySlug) : entries

  if (targets.length === 0) {
    console.error(`No entries found${onlySlug ? ` for slug: ${onlySlug}` : ''}`)
    process.exit(1)
  }

  console.log(`Converting ${targets.length} skill(s)${dryRun ? ' (dry-run)' : ''}...`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const entry of targets) {
    const outPath = join(CONTENT_BASE, `${entry.slug}.md`)

    try {
      assertOutputPath(outPath)
    } catch (e) {
      console.error(`[SKIP] ${entry.slug}: ${(e as Error).message}`)
      failed++
      continue
    }

    if (!force && existsSync(outPath)) {
      console.log(`[SKIP] ${entry.slug} already exists (use --force to overwrite)`)
      skipped++
      continue
    }

    const sourcePath = resolveSourcePath(entry.sourcePath)
    if (!existsSync(sourcePath)) {
      console.error(`[FAIL] ${entry.slug}: source not found at ${sourcePath}`)
      failed++
      continue
    }

    const sourceContent = readFileSync(sourcePath, 'utf8')

    if (dryRun) {
      console.log(`[DRY] ${entry.slug} → ${outPath}`)
      success++
      continue
    }

    console.log(`[CONV] ${entry.slug}...`)
    try {
      const body = translateWithClaude(sourceContent, entry.title)
      const frontmatter = buildFrontmatter(entry)
      const fullContent = `${frontmatter}\n\n${body}\n`

      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, fullContent, 'utf8')
      console.log(`[OK]   ${entry.slug}`)
      success++
    } catch (e) {
      console.error(`[FAIL] ${entry.slug}: ${(e as Error).message}`)
      failed++
    }
  }

  console.log(`\nDone: ${success} ok, ${skipped} skipped, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main()
