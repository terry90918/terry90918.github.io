import { defineConfig } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? '3001')
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('E2E_PORT must be an integer from 1 to 65535')
const localURL = `http://127.0.0.1:${port}`
const externalURL = process.env.E2E_LOCAL_SERVER === '1' ? undefined : process.env.BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'line',
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: externalURL ?? localURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: externalURL
    ? undefined
    : {
        command: `bun dev --webpack --hostname 127.0.0.1 --port ${port}`,
        url: `${localURL}/work`,
        reuseExistingServer: false,
        timeout: 300000,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      },
  projects: [
    { name: 'frontend', testMatch: /frontend-.*\.spec\.ts/, use: { browserName: 'chromium' } },
  ],
})
