import { defineConfig } from '@playwright/test'
import config from './playwright.config'

// This entry point must fail, rather than skip, when its isolated fixture is absent.
for (const key of [
  'SCHEDULER_API_ORIGIN',
  'VITE_SCHEDULER_COMPANY_ID',
  'VITE_SCHEDULER_SERVICE_MAP',
  'SCHEDULER_E2E_EMPLOYEE_ID',
  'SCHEDULER_E2E_REDIS_CONTAINER',
]) {
  if (!process.env[key]) throw new Error(`Missing integration fixture: ${key}`)
}
process.env.SCHEDULER_E2E_REAL = '1'

export default defineConfig({
  ...config,
  testMatch: 'native-booking-real.spec.ts',
  workers: 1,
  timeout: 90_000,
  projects: config.projects?.filter(
    (project) => project.name === 'Desktop Chromium',
  ),
})
