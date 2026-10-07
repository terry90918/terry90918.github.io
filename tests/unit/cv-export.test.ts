import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, it } from 'vitest'

it('adds legacy CV directory URLs while preserving main-site files and root assets', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'cv-export-'))
  try {
    mkdirSync(path.join(directory, 'out/cv/en/case-study'), { recursive: true })
    for (const file of ['cv.html', 'cv/en.html', 'cv/en/case-study/jurislm.html', 'about.html']) {
      writeFileSync(
        path.join(directory, 'out', file),
        `<html>${file}<script src="/_next/main.js"></script></html>`
      )
    }
    const result = spawnSync(process.execPath, [path.resolve('scripts/finish-cv-export.mjs')], {
      cwd: directory,
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    for (const [source, alias] of [
      ['cv.html', 'cv/index.html'],
      ['cv/en.html', 'cv/en/index.html'],
      ['cv/en/case-study/jurislm.html', 'cv/en/case-study/jurislm/index.html'],
    ]) {
      expect(readFileSync(path.join(directory, 'out', alias), 'utf8')).toBe(
        readFileSync(path.join(directory, 'out', source), 'utf8')
      )
    }
    expect(existsSync(path.join(directory, 'out/about/index.html'))).toBe(false)
    expect(existsSync(path.join(directory, 'out/cv/_next'))).toBe(false)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
