import { spawnSync } from 'node:child_process'

const stages = [
  'format:check',
  'lint',
  'typecheck',
  'test:unit',
  'test:integration',
  'test:e2e',
  'build',
]

for (const stage of stages) {
  console.log(`\n[verify] ${stage}`)
  const result = spawnSync('bun', ['run', stage], {
    stdio: 'inherit',
    env: { ...process.env, E2E_LOCAL_SERVER: '1' },
  })
  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}
