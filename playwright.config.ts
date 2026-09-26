import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

// Expose VITE_* from .env to the Playwright process (skip gates / assertions).
const viteEnv = loadEnv(
  process.env.MODE ?? process.env.NODE_ENV ?? 'production',
  process.cwd(),
  'VITE_',
)
for (const [key, value] of Object.entries(viteEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}

const PORT = 4173
const HOST = '127.0.0.1'
const isCI = Boolean(process.env.CI)
// `exec` keeps the server in Playwright's process group so teardown kills it;
// `pnpm start` would move it to its own group and leave it running.
const webServerCommand = isCI
  ? 'exec node .output/server/index.mjs'
  : 'pnpm build && exec node .output/server/index.mjs'

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
      HOST,
      PORT: String(PORT),
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
    ...(isCI
      ? [
          {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13'] },
          },
        ]
      : []),
  ],
})
