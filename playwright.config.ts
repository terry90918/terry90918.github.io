import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 前置作業：登入並儲存認證狀態
    {
      name: 'admin-setup',
      testMatch: /admin-setup\.ts/,
    },
    // Admin 測試依賴前置登入
    {
      name: 'admin',
      testMatch: /admin-.*\.spec\.ts/,
      dependencies: ['admin-setup'],
      use: {
        storageState: 'tests/e2e/.auth/admin.json',
        browserName: 'chromium',
      },
    },
    // 前端測試獨立運行
    {
      name: 'frontend',
      testMatch: /frontend-.*\.spec\.ts/,
      use: { browserName: 'chromium' },
    },
  ],
})
