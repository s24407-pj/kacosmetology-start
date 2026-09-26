import { PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY } from '@libs/renderTime'
import { expect, type Page, test } from '@playwright/test'
import { ready, seedConsent } from './helpers'

function collectRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().startsWith('Failed to load resource')
    ) {
      errors.push(message.text())
    }
  })
  return errors
}

test.beforeEach(async ({ page }) => {
  await seedConsent(page)
})

for (const path of [
  '/',
  '/kosmetologia',
  '/oprawa-oka/regulacja-brwi',
  '/trychologia',
  '/galeria',
  '/polityka-prywatnosci',
  '/nieistniejacy-adres',
]) {
  test(`${path} hydrates without runtime or hydration errors`, async ({
    page,
  }) => {
    const errors = collectRuntimeErrors(page)
    await ready(page, path)
    expect(errors).toEqual([])
  })
}

for (const { state, time, badge } of [
  {
    state: 'open',
    time: '2026-09-28T10:00:00+02:00',
    badge: 'Otwarte teraz',
  },
  {
    state: 'closed',
    time: '2026-09-27T12:00:00+02:00',
    badge: 'Obecnie zamknięte',
  },
]) {
  test(`opening status renders ${state} identically on server and client`, async ({
    page,
    request,
  }) => {
    const path = `/?${PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY}=${encodeURIComponent(time)}`
    expect(await (await request.get(path)).text()).toContain(badge)

    const errors = collectRuntimeErrors(page)
    await ready(page, path)
    await expect(page.locator('#kontakt')).toContainText(badge)
    expect(errors).toEqual([])
  })
}
