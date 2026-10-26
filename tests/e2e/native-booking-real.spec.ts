import { execFileSync } from 'node:child_process'
import { randomInt } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { ready, seedConsent } from './helpers'

const company = process.env.VITE_SCHEDULER_COMPANY_ID ?? ''
const mappings = JSON.parse(
  process.env.VITE_SCHEDULER_SERVICE_MAP ?? '{}',
) as Record<string, string>
const service =
  process.env.SCHEDULER_E2E_SERVICE_ID ??
  mappings['service-regulacja-brwi'] ??
  ''
const employee = process.env.SCHEDULER_E2E_EMPLOYEE_ID ?? ''
const redisContainer = process.env.SCHEDULER_E2E_REDIS_CONTAINER ?? ''

// Isolated dev SMS stores OTP only in Redis. Avoid persisting credentials/codes in request traces.
test.use({ trace: 'off' })
test.beforeEach(async ({ page }) => {
  test.skip(
    process.env.SCHEDULER_E2E_REAL !== '1',
    'Explicitly enable against an isolated Spring dev API with mock SMS.',
  )
  expect(Boolean(company && service && employee && redisContainer)).toBe(true)
  await seedConsent(page)
})

test('real browser OTP, lost committed result, cancellation replay and returning booking through same-origin proxy', async ({
  page,
  context,
}, testInfo) => {
  const phone = `+486${String(randomInt(10_000_000, 99_999_999))}`
  const writes: { body: unknown; key: string; context: string }[] = []
  let committed:
    | { id: string; revision: number; companyId: string; status: string }
    | undefined
  let loseFirstResponse = true
  await page.route('**/api/reservations', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    writes.push({
      body: route.request().postDataJSON(),
      key: route.request().headers()['idempotency-key'],
      context: route.request().headers()['x-expected-session-context'],
    })
    const actual = await route.fetch()
    if (actual.status() === 201 && loseFirstResponse) {
      loseFirstResponse = false
      committed = await actual.json()
      return route.abort('failed')
    }
    await route.fulfill({ response: actual })
  })

  await ready(page, '/rezerwacja?service=service-regulacja-brwi')
  await expect(page.getByLabel('Usługa', { exact: true })).toHaveValue(service)
  await page.getByLabel('Specjalista', { exact: true }).selectOption(employee)
  // Separate projects/workers use different future dates, leaving the shared dev calendar intact.
  const baseDate = new Date()
  baseDate.setUTCDate(
    baseDate.getUTCDate() +
      35 +
      testInfo.parallelIndex * 3 +
      (testInfo.project.name.includes('Mobile') ? 14 : 0),
  )
  let selectedDate = ''
  let selectedTime = ''
  for (let day = 0; day < 10; day++) {
    const date = new Date(baseDate)
    date.setUTCDate(date.getUTCDate() + day)
    const candidate = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
    const slots = await page.request.get(
      `/api/availability?employeeId=${employee}&serviceId=${service}&date=${candidate}`,
    )
    expect(slots.status()).toBe(200)
    const list = (await slots.json()) as {
      time: string
      personalConflict: boolean
    }[]
    const available = list.find((slot) => !slot.personalConflict)
    if (available) {
      selectedDate = candidate
      selectedTime = available.time
      break
    }
  }
  expect(Boolean(selectedDate && selectedTime)).toBe(true)
  await page.getByLabel('Data', { exact: true }).fill(selectedDate)
  await expect(
    page
      .getByLabel('Godzina', { exact: true })
      .locator(`option[value="${selectedTime}"]`),
  ).toBeAttached()
  await page.getByLabel('Godzina', { exact: true }).selectOption(selectedTime)
  await page.getByLabel('Telefon z prefiksem kraju').fill(phone)
  await page.getByLabel(/Potwierdzam pełny numer/).check()
  await page
    .getByRole('button', { name: 'Wyślij kod SMS', exact: true })
    .click()
  await expect(page.getByLabel('Kod SMS', { exact: true })).toBeVisible()
  const code = execFileSync(
    'podman',
    ['exec', redisContainer, 'redis-cli', 'GET', `otp:${company}:${phone}`],
    { encoding: 'utf8' },
  ).trim()
  expect(/^\d{6}$/.test(code)).toBe(true)
  await page.getByLabel('Kod SMS', { exact: true }).fill(code)
  await page.getByRole('button', { name: 'Potwierdź kod', exact: true }).click()
  await expect(page.getByLabel('Imię', { exact: true })).toBeVisible()
  await page.getByLabel('Imię', { exact: true }).fill('Ewa')
  await page.getByLabel('Nazwisko', { exact: true }).fill('Testowa')
  await expect(
    page
      .getByLabel('Godzina', { exact: true })
      .locator(`option[value="${selectedTime}"]`),
  ).toBeAttached()
  await page.getByLabel('Godzina', { exact: true }).selectOption(selectedTime)
  await page
    .getByRole('button', { name: 'Pobierz aktualną ofertę', exact: true })
    .click()
  await page
    .getByLabel('Akceptuję powyższą cenę, czas trwania i termin.')
    .check()
  await page
    .getByRole('button', { name: 'Rezerwuję wizytę', exact: true })
    .click()
  await expect(
    page.getByRole('button', {
      name: 'Sprawdź wynik tego samego zgłoszenia',
      exact: true,
    }),
  ).toBeEnabled()
  expect(Boolean(committed?.id)).toBe(true)
  expect(committed?.status).toBe('BOOKED')
  const sessionResponse = await page.request.get('/api/auth/me')
  expect(sessionResponse.status()).toBe(200)
  expect(sessionResponse.headers()['cache-control']).toContain('no-store')
  const identity = (await sessionResponse.json()) as {
    userId: string
    companyId: string
  }
  const csrfResponse = await page.request.get('/api/auth/csrf')
  const csrf = (await csrfResponse.json()) as { token: string }
  const scope = `v1:${identity.userId}:${identity.companyId}:null:ROLE_CUSTOMER`
  const cancellation = await page.request.patch(
    `/api/reservations/${committed!.id}/cancel`,
    {
      headers: {
        'X-XSRF-TOKEN': csrf.token,
        'X-Expected-Session-Context': scope,
        'If-Match': String(committed!.revision),
      },
      data: { reason: 'Test odzyskiwania wyniku' },
    },
  )
  expect(cancellation.status()).toBe(204)
  const sessionCookie = (await context.cookies()).find(
    (cookie) => cookie.name === 'SESSION',
  )
  expect(sessionCookie?.httpOnly).toBe(true)
  expect(sessionCookie?.sameSite).toBe('Lax')
  await page.reload()
  await page
    .getByRole('button', {
      name: 'Sprawdź wynik tego samego zgłoszenia',
      exact: true,
    })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Wizyta anulowana', exact: true }),
  ).toBeVisible()
  expect(writes).toHaveLength(2)
  expect(writes[1]).toEqual(writes[0])
  expect(writes[0].context).toBe(scope)

  // A fresh page after the resolved attempt recognizes the now-established salon profile.
  await page.reload()
  await expect(page.getByText(/Telefon potwierdzony:/)).toBeVisible()
  await expect(page.getByLabel('Imię', { exact: true })).toHaveCount(0)
  await page.getByLabel('Specjalista', { exact: true }).selectOption(employee)
  await page.getByLabel('Data', { exact: true }).fill(selectedDate)
  await expect(
    page
      .getByLabel('Godzina', { exact: true })
      .locator(`option[value="${selectedTime}"]`),
  ).toBeAttached()
  await page.getByLabel('Godzina', { exact: true }).selectOption(selectedTime)
  await page
    .getByRole('button', { name: 'Pobierz aktualną ofertę', exact: true })
    .click()
  await page
    .getByLabel('Akceptuję powyższą cenę, czas trwania i termin.')
    .check()
  await page
    .getByRole('button', { name: 'Rezerwuję wizytę', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Wizyta zarezerwowana', exact: true }),
  ).toBeVisible()
  expect(writes).toHaveLength(3)
  expect(writes[2].body).not.toHaveProperty('firstVisitDetails')
  expect(writes[2].key).not.toBe(writes[0].key)
})
