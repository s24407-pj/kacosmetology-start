import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const HOST = '127.0.0.1'
const isCI = Boolean(process.env.CI)
const webServerCommand = isCI
  ? `HOST=${HOST} PORT=${PORT} pnpm start`
  : `pnpm build && HOST=${HOST} PORT=${PORT} pnpm start`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  failOnFlakyTests: isCI,
  reporter: isCI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : 'list',
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: isCI ? 'retain-on-failure-and-retries' : 'retain-on-failure',
  },
  webServer: {
    command: webServerCommand,
    url: `http://${HOST}:${PORT}`,
    env: {
      PLAYWRIGHT_TEST_MODE: '1',
    },
    reuseExistingServer: false,
    stderr: 'pipe',
    stdout: 'pipe',
  },
  projects: [
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
})
