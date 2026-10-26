import AxeBuilder from '@axe-core/playwright'
import type { Session } from '@libs/booking/contracts'
import { expect, type Page, type Route, test } from '@playwright/test'
import { ready, seedConsent } from './helpers'

const company = process.env.VITE_SCHEDULER_COMPANY_ID ?? ''
const mapping = JSON.parse(
  process.env.VITE_SCHEDULER_SERVICE_MAP ?? '{}',
) as Record<string, string>
const service =
  mapping['service-regulacja-brwi'] ?? '00000000-0000-4000-8000-000000000002'
const customer = '00000000-0000-4000-8000-000000000003'
const employee = '00000000-0000-4000-8000-000000000004'
const quoteId = '00000000-0000-4000-8000-000000000005'
const secondCustomer = '00000000-0000-4000-8000-000000000006'
const reservationId = '00000000-0000-4000-8000-000000000007'
const session: Session = {
  userId: customer,
  companyId: company,
  employmentId: null,
  username: '+48500100200',
  authorities: ['ROLE_CUSTOMER'],
}
type Write = {
  body: Record<string, unknown>
  key: string
  context: string
  csrf: string
}
type State = {
  identity: Session | null
  profileState: 'PENDING' | 'ESTABLISHED'
  writes: Write[]
  otpRequests: Record<string, unknown>[]
  csrfIssued: number
  anonymousReadinessRequests: number
  quoteExpires: string
  outcome: 'BOOKED' | 'CANCELLED'
  onBook?: (route: Route, write: Write, state: State) => Promise<void>
}
const json = (
  route: Route,
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store', ...headers },
    body: JSON.stringify(body),
  })

function confirmation(write: Write, status: State['outcome']) {
  const startTime = String(write.body.startTime)
  return {
    id: reservationId,
    companyId: company,
    companyName: 'Salon testowy',
    serviceName: 'Cena z API',
    employeeName: 'Anna Salon',
    startTime,
    endTime: `${startTime.slice(0, 11)}14:30:00`,
    price: 123,
    durationMinutes: 30,
    revision: status === 'CANCELLED' ? 1 : 0,
    status,
    archived: status === 'CANCELLED',
  }
}
async function mockApi(page: Page, authenticated = true): Promise<State> {
  const state: State = {
    identity: authenticated ? { ...session } : null,
    profileState: 'PENDING',
    writes: [],
    otpRequests: [],
    csrfIssued: 0,
    anonymousReadinessRequests: 0,
    quoteExpires: new Date(Date.now() + 600_000).toISOString(),
    outcome: 'BOOKED',
  }
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/api/auth/csrf')
      return json(route, { token: `csrf-${++state.csrfIssued}` })
    if (path === '/api/auth/me')
      return state.identity
        ? json(route, state.identity)
        : json(route, { code: 'UNAUTHORIZED' }, 401)
    if (path === '/api/users/me') {
      if (!state.identity) state.anonymousReadinessRequests++
      return json(route, {
        id: state.identity?.userId,
        companyId: company,
        phoneNumber: state.identity?.username,
        profileState: state.profileState,
      })
    }
    if (path.startsWith('/api/offerings/public/'))
      return json(route, [
        {
          id: service,
          companyId: company,
          name: 'Usługa z API',
          price: 123,
          durationMinutes: 30,
          active: true,
        },
        {
          id: secondCustomer,
          companyId: secondCustomer,
          name: 'Obca usługa',
          price: 1,
          durationMinutes: 30,
          active: true,
        },
      ])
    if (path.startsWith('/api/employees/public/'))
      return json(route, [
        { id: employee, firstName: 'Anna', lastName: 'Salon' },
      ])
    if (path === '/api/availability')
      return json(route, [
        {
          time: '14:00:00',
          price: 123,
          originalPrice: 123,
          personalConflict: false,
        },
      ])
    if (path === '/api/auth/request-code') {
      state.otpRequests.push(request.postDataJSON())
      return json(route, { message: 'Kod wysłany' })
    }
    if (path === '/api/auth/verify-code') {
      expect(request.postDataJSON()).toEqual({
        companyId: company,
        phoneNumber: '+48500100200',
        code: '123456',
      })
      state.identity = { ...session }
      return json(route, { role: 'ROLE_CUSTOMER' })
    }
    if (path === '/api/auth/logout') {
      state.identity = null
      return route.fulfill({ status: 204 })
    }
    if (path === '/api/quotes')
      return json(
        route,
        {
          quoteId,
          companyId: company,
          serviceId: service,
          serviceName: 'Cena z API',
          price: 123,
          durationMinutes: 30,
          startTime: request.postDataJSON().startTime,
          expiresAt: state.quoteExpires,
        },
        201,
      )
    if (path === '/api/reservations') {
      const write = {
        body: request.postDataJSON(),
        key: request.headers()['idempotency-key'],
        context: request.headers()['x-expected-session-context'],
        csrf: request.headers()['x-xsrf-token'],
      }
      state.writes.push(write)
      if (state.onBook) return state.onBook(route, write, state)
      state.profileState = 'ESTABLISHED'
      return json(
        route,
        confirmation(write, state.outcome),
        state.outcome === 'BOOKED' ? 201 : 200,
      )
    }
    throw new Error(
      `Unexpected mocked booking request: ${request.method()} ${path}`,
    )
  })
  return state
}
async function open(page: Page) {
  await ready(page, '/rezerwacja?service=service-regulacja-brwi')
  await expect(page.getByLabel('Usługa', { exact: true })).toHaveValue(service)
  await expect(page.getByText('Sprawdzamy sesję…')).toHaveCount(0)
}
async function chooseTime(page: Page) {
  await expect(
    page.getByRole('option', { name: '14:00', exact: true }),
  ).toBeAttached()
  await page.getByLabel('Godzina', { exact: true }).selectOption('14:00:00')
}
async function names(page: Page) {
  await page.getByLabel('Imię', { exact: true }).fill('Ewa')
  await page.getByLabel('Nazwisko', { exact: true }).fill('Nowak')
}
async function quote(page: Page) {
  const button = page.getByRole('button', {
    name: 'Pobierz aktualną ofertę',
    exact: true,
  })
  await button.focus()
  await page.keyboard.press('Enter')
  await page
    .getByLabel('Akceptuję powyższą cenę, czas trwania i termin.')
    .check()
}
const book = (page: Page) =>
  page.getByRole('button', { name: 'Rezerwuję wizytę', exact: true }).click()
const retry = (page: Page) =>
  page.getByRole('button', {
    name: 'Sprawdź wynik tego samego zgłoszenia',
    exact: true,
  })

test.beforeEach(async ({ page }) => {
  expect(Boolean(company)).toBe(true)
  await seedConsent(page)
})

test('native first visit maps marketing ID, confirms phone, refreshes CSRF and accepts authoritative terms', async ({
  page,
}) => {
  const state = await mockApi(page, false)
  await open(page)
  await expect(page.getByRole('option', { name: 'Obca usługa' })).toHaveCount(0)
  await chooseTime(page)
  await page.getByLabel('Telefon z prefiksem kraju').fill('+48 (500) 100-200')
  await page.getByLabel(/Potwierdzam pełny numer/).check()
  await page
    .getByRole('button', { name: 'Wyślij kod SMS', exact: true })
    .click()
  await page.getByLabel('Kod SMS', { exact: true }).fill('123456')
  await page.getByRole('button', { name: 'Potwierdź kod', exact: true }).click()
  await expect(page.getByLabel('Imię', { exact: true })).toBeVisible()
  await chooseTime(page)
  await names(page)
  await page.getByLabel('E-mail (opcjonalnie)').fill('ewa@example.test')
  await quote(page)
  const a11y = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(a11y.violations).toEqual([])
  await book(page)
  await expect(
    page.getByRole('heading', { name: 'Wizyta zarezerwowana', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Wynik rezerwacji' }),
  ).toContainText('123 zł')
  expect(state.writes).toHaveLength(1)
  expect(state.writes[0].body).toMatchObject({
    serviceId: service,
    employeeId: null,
    quoteId,
    firstVisitDetails: {
      firstName: 'Ewa',
      lastName: 'Nowak',
      contactEmail: 'ewa@example.test',
    },
  })
  expect(state.writes[0].key).toMatch(/^[0-9a-f-]{36}$/)
  expect(state.writes[0].context).toBe(
    `v1:${customer}:${company}:null:ROLE_CUSTOMER`,
  )
  expect(state.writes[0].csrf).toBe('csrf-2')
  expect(state.otpRequests).toEqual([
    { companyId: company, phoneNumber: '+48500100200' },
  ])
  expect(state.anonymousReadinessRequests).toBe(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true)
})

test('returning customer chooses a specialist without re-entering establishment details', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.profileState = 'ESTABLISHED'
  await open(page)
  await page.getByLabel('Specjalista', { exact: true }).selectOption(employee)
  await chooseTime(page)
  await expect(page.getByLabel('Imię', { exact: true })).toHaveCount(0)
  await quote(page)
  await book(page)
  await expect(
    page.getByRole('heading', { name: 'Wizyta zarezerwowana', exact: true }),
  ).toBeVisible()
  expect(state.writes[0].body.employeeId).toBe(employee)
  expect(state.writes[0].body).not.toHaveProperty('firstVisitDetails')
})

test('profile establishment race requires explicit acknowledgement before a changed intent', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.onBook = async (route, write, current) => {
    if (current.writes.length === 1) {
      current.profileState = 'ESTABLISHED'
      return json(route, { code: 'CUSTOMER_PROFILE_CHANGED' }, 409)
    }
    return json(route, confirmation(write, 'BOOKED'), 201)
  }
  await open(page)
  await chooseTime(page)
  await names(page)
  await quote(page)
  await book(page)
  const acknowledge = page.getByLabel(/Rozumiem, że moje dane/)
  await expect(acknowledge).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Rezerwuję wizytę', exact: true }),
  ).toBeDisabled()
  expect(state.writes).toHaveLength(1)
  await acknowledge.check()
  await book(page)
  await expect(
    page.getByRole('heading', { name: 'Wizyta zarezerwowana', exact: true }),
  ).toBeVisible()
  expect(state.writes).toHaveLength(2)
  expect(state.writes[1].key).not.toBe(state.writes[0].key)
  expect(state.writes[1].body).not.toHaveProperty('firstVisitDetails')
})

test('unknown outcome survives rate limit and reload, replays exact request and displays current cancellation', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.onBook = async (route, write, current) => {
    if (current.writes.length === 1) return route.abort('failed')
    if (current.writes.length === 2)
      return json(route, { code: 'RATE_LIMIT_EXCEEDED' }, 429, {
        'Retry-After': '1',
      })
    return json(route, confirmation(write, 'CANCELLED'))
  }
  await open(page)
  await chooseTime(page)
  await names(page)
  await quote(page)
  await book(page)
  await retry(page).click()
  await expect.poll(() => state.writes.length).toBe(2)
  await page.reload()
  await expect(retry(page)).toBeEnabled()
  await retry(page).click()
  await expect(
    page.getByRole('heading', { name: 'Wizyta anulowana', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Wynik rezerwacji' }),
  ).toContainText('zarchiwizowana')
  await expect(
    page.getByRole('heading', { name: 'Wizyta zarezerwowana', exact: true }),
  ).toHaveCount(0)
  expect(state.writes).toHaveLength(3)
  expect(state.writes[1]).toEqual(state.writes[0])
  expect(state.writes[2].body).toEqual(state.writes[0].body)
  expect(state.writes[2].key).toBe(state.writes[0].key)
  expect(state.writes[2].context).toBe(state.writes[0].context)
})

test('refreshing to another customer clears private draft and accepted quote before another write', async ({
  page,
}) => {
  const state = await mockApi(page)
  await open(page)
  await chooseTime(page)
  await names(page)
  await quote(page)
  state.identity = {
    ...session,
    userId: secondCustomer,
    username: '+48500999888',
  }
  await page.getByRole('button', { name: 'Odśwież sesję', exact: true }).click()
  await expect(page.getByLabel('Imię', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Nazwisko', { exact: true })).toHaveValue('')
  await expect(
    page.getByLabel('Akceptuję powyższą cenę, czas trwania i termin.'),
  ).toHaveCount(0)
  await expect(page.getByRole('alert')).toContainText(
    'Dane formularza zostały usunięte',
  )
  expect(state.writes).toHaveLength(0)
})

test('wrong-role session must be logged out explicitly and quote expiry prevents submission', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.identity = {
    ...session,
    authorities: ['ROLE_OWNER'],
    employmentId: employee,
  }
  await open(page)
  await expect(page.getByText(/Aktywna sesja należy/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Rezerwuję wizytę', exact: true }),
  ).toHaveCount(0)
  expect(state.writes).toHaveLength(0)
  await page.getByRole('button', { name: 'Wyloguj', exact: true }).click()
  await expect(page.getByLabel('Telefon z prefiksem kraju')).toBeVisible()
  state.identity = { ...session }
  state.profileState = 'ESTABLISHED'
  await page.reload()
  await chooseTime(page)
  state.quoteExpires = new Date(Date.now() - 1000).toISOString()
  await page
    .getByRole('button', { name: 'Pobierz aktualną ofertę', exact: true })
    .click()
  await expect(
    page.getByText('Oferta wygasła. Pobierz aktualną ofertę.', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Rezerwuję wizytę', exact: true }),
  ).toBeDisabled()
  expect(state.writes).toHaveLength(0)
})

test('reservation heading remains below fixed navigation with an active promotion', async ({
  page,
}) => {
  await mockApi(page)
  await page.goto(
    '/rezerwacja?service=service-regulacja-brwi&__pwReferenceTime=2026-10-25T12%3A00%3A00Z',
  )
  await expect(page.locator('html')).toHaveAttribute(
    'data-react-client-ready',
    'true',
  )
  await expect(
    page.getByRole('status', { name: 'Aktywna promocja' }),
  ).toBeVisible()
  const header = await page
    .getByRole('navigation', { name: 'Główna nawigacja' })
    .boundingBox()
  const heading = await page
    .getByRole('heading', { level: 1, name: 'Rezerwacja wizyty' })
    .boundingBox()
  expect(header).not.toBeNull()
  expect(heading).not.toBeNull()
  expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height)
})
