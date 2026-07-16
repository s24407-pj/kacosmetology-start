import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const HOST = '127.0.0.1'
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
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
    command: `pnpm build && HOST=${HOST} PORT=${PORT} pnpm start`,
    url: `http://${HOST}:${PORT}`,
    // Opt-in reuse avoids false failures when an outdated preview server is already running.
    reuseExistingServer: process.env.PW_REUSE_SERVER === '1',
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
