import '@testing-library/jest-dom/vitest'
import type {
  BookingBody,
  Employee,
  Profile,
  Reservation,
  Session,
} from '@libs/booking/contracts'
import {
  ATTEMPT_KEY,
  hasUnresolved,
  newAttempt,
  RETENTION_MS,
  readAttempt,
  recoveryKey,
  saveAttempt,
} from '@libs/booking/recovery'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReservationPage from './ReservationPage'

const company = '00000000-0000-4000-8000-000000000001'
const service = '00000000-0000-4000-8000-000000000002'
const customer = '00000000-0000-4000-8000-000000000003'
const employee = '00000000-0000-4000-8000-000000000004'
const quoteId = '00000000-0000-4000-8000-000000000005'
const other = '00000000-0000-4000-8000-000000000006'
const session: Session = {
  userId: customer,
  companyId: company,
  employmentId: null,
  username: '+48500100200',
  authorities: ['ROLE_CUSTOMER'],
}
const body: BookingBody = {
  serviceId: service,
  employeeId: null,
  quoteId,
  startTime: '2030-10-26T14:00:00',
  firstVisitDetails: { firstName: 'Ewa', lastName: 'Nowak' },
}
const reservation: Reservation = {
  id: '00000000-0000-4000-8000-000000000007',
  companyId: company,
  companyName: 'Salon',
  serviceName: 'Usługa API',
  employeeName: 'Anna Salon',
  startTime: body.startTime,
  endTime: '2030-10-26T14:30:00',
  price: 123,
  durationMinutes: 30,
  status: 'BOOKED',
  archived: false,
}
let employees: Employee[]
let onAvailability: (path: string) => Response | Promise<Response>
let identity: Session | null
let profile: Profile
let onBook: (init: RequestInit) => Response | Promise<Response>
let calls: { path: string; init: RequestInit }[]
let quoteExpires: string
const ok = (value: unknown) => Response.json(value)

beforeEach(() => {
  employees = [{ id: employee, firstName: 'Anna', lastName: 'Salon' }]
  onAvailability = () =>
    ok([
      {
        time: '14:00:00',
        price: 123,
        originalPrice: 123,
        personalConflict: false,
      },
    ])
  identity = { ...session }
  profile = {
    id: customer,
    companyId: company,
    phoneNumber: session.username,
    profileState: 'PENDING',
  }
  calls = []
  quoteExpires = new Date(Date.now() + 600000).toISOString()
  onBook = () => ok(reservation)
  sessionStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const path = String(input)
      calls.push({ path, init })
      if (path === '/api/auth/csrf') return ok({ token: 'csrf' })
      if (path === '/api/auth/me')
        return identity
          ? ok(identity)
          : Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
      if (path === '/api/users/me') return ok(profile)
      if (path.startsWith('/api/offerings/public/'))
        return ok([
          {
            id: service,
            companyId: company,
            name: 'Usługa API',
            price: 123,
            durationMinutes: 30,
            active: true,
          },
          { id: other, companyId: other, name: 'Obca', active: true },
        ])
      if (path.startsWith('/api/employees/public/')) return ok(employees)
      if (path.startsWith('/api/availability')) return onAvailability(path)
      if (path === '/api/auth/request-code') return ok({ message: 'ok' })
      if (path === '/api/auth/verify-code') {
        identity = { ...session }
        return ok({})
      }
      if (path === '/api/auth/logout') {
        identity = null
        return new Response(null, { status: 204 })
      }
      if (path === '/api/quotes')
        return ok({
          quoteId,
          companyId: company,
          serviceId: service,
          serviceName: 'Cena API',
          price: 123,
          durationMinutes: 30,
          startTime: body.startTime,
          expiresAt: quoteExpires,
        })
      if (path === '/api/reservations') return onBook(init)
      throw new Error(`Unhandled ${path}`)
    }),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
async function mount() {
  const user = userEvent.setup()
  render(
    <ReservationPage
      company={company}
      initialService="service-regulacja-brwi"
      mapping={{ 'service-regulacja-brwi': service }}
    />,
  )
  await waitFor(() =>
    expect(screen.queryByText('Sprawdzamy sesję…')).not.toBeInTheDocument(),
  )
  return user
}
async function chooseTime(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() =>
    expect(screen.getByRole('option', { name: '14:00' })).toBeInTheDocument(),
  )
  await user.selectOptions(screen.getByLabelText('Godzina'), '14:00:00')
}
async function acceptQuote(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', { name: 'Pobierz aktualną ofertę' }),
  )
  await user.click(
    await screen.findByLabelText(
      'Akceptuję powyższą cenę, czas trwania i termin.',
    ),
  )
}
async function enterNames(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Imię'), 'Ewa')
  await user.type(screen.getByLabelText('Nazwisko'), 'Nowak')
}

describe('native booking', () => {
  it.each([404, 500])(
    'keeps available slots when another specialist returns %i and clears the warning after recovery',
    async (status) => {
      employees.push({ id: other, firstName: 'Jan', lastName: 'Salon' })
      const available = onAvailability
      onAvailability = (path) =>
        path.includes(`employeeId=${other}`)
          ? Response.json({ code: 'UNAVAILABLE' }, { status })
          : available(path)
      const user = await mount()
      await chooseTime(user)
      expect(
        screen.getByText(/Nie udało się pobrać terminów części/),
      ).toBeVisible()
      expect(screen.getByLabelText('Godzina')).toHaveValue('14:00:00')
      await acceptQuote(user)
      expect(
        screen.getByLabelText(
          'Akceptuję powyższą cenę, czas trwania i termin.',
        ),
      ).toBeChecked()
      onAvailability = available
      await user.selectOptions(screen.getByLabelText('Specjalista'), other)
      await chooseTime(user)
      expect(
        screen.queryByText(/Nie udało się pobrać terminów części/),
      ).not.toBeInTheDocument()
    },
  )
  it('reports complete availability failure without claiming the day has no slots', async () => {
    onAvailability = () => Response.json({}, { status: 500 })
    await mount()
    expect(
      await screen.findByText(
        'Nie udało się pobrać dostępnych terminów. Spróbuj ponownie później.',
      ),
    ).toBeVisible()
    expect(
      screen.queryByText(/Brak dostępnych terminów/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: '14:00' }),
    ).not.toBeInTheDocument()
  })
  it('preselects only configured API services and books first visit with confirmed OTP and server terms', async () => {
    identity = null
    const user = await mount()
    expect(screen.getByLabelText('Usługa')).toHaveValue(service)
    expect(
      screen.queryByRole('option', { name: 'Obca' }),
    ).not.toBeInTheDocument()
    await chooseTime(user)
    await user.clear(screen.getByLabelText('Telefon z prefiksem kraju'))
    await user.type(
      screen.getByLabelText('Telefon z prefiksem kraju'),
      '+48 (500) 100-200',
    )
    await user.click(screen.getByLabelText(/Potwierdzam pełny numer/))
    await user.click(screen.getByRole('button', { name: 'Wyślij kod SMS' }))
    await user.type(await screen.findByLabelText('Kod SMS'), '123456')
    await user.click(screen.getByRole('button', { name: 'Potwierdź kod' }))
    await screen.findByLabelText('Imię')
    // Availability is refreshed after authentication.
    await chooseTime(user)
    await enterNames(user)
    await user.type(
      screen.getByLabelText('E-mail (opcjonalnie)'),
      'ewa@example.test',
    )
    await acceptQuote(user)
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    expect(
      await screen.findByRole('heading', { name: 'Wizyta zarezerwowana' }),
    ).toBeVisible()
    const request = calls.find((c) => c.path === '/api/reservations')!.init
    expect(JSON.parse(String(request.body))).toEqual({
      ...body,
      firstVisitDetails: {
        firstName: 'Ewa',
        lastName: 'Nowak',
        contactEmail: 'ewa@example.test',
      },
    })
    expect(new Headers(request.headers).get('X-Expected-Session-Context')).toBe(
      `v1:${customer}:${company}:null:ROLE_CUSTOMER`,
    )
    expect(new Headers(request.headers).get('Idempotency-Key')).toBeTruthy()
    expect(hasUnresolved(session)).toBe(false)
    expect(
      JSON.parse(
        String(
          calls.find((c) => c.path === '/api/auth/request-code')!.init.body,
        ),
      ),
    ).toEqual({ companyId: company, phoneNumber: '+48500100200' })
  })
  it('returning customers omit establishment details and explicitly select a specialist', async () => {
    profile.profileState = 'ESTABLISHED'
    const user = await mount()
    await chooseTime(user)
    await user.selectOptions(screen.getByLabelText('Specjalista'), employee)
    await chooseTime(user)
    expect(screen.queryByLabelText('Imię')).not.toBeInTheDocument()
    await acceptQuote(user)
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    await screen.findByRole('heading', { name: 'Wizyta zarezerwowana' })
    expect(
      JSON.parse(
        String(calls.find((c) => c.path === '/api/reservations')!.init.body),
      ),
    ).toEqual({ ...body, employeeId: employee, firstVisitDetails: undefined })
  })
  it('requires acknowledgement of a concurrently established profile and uses a new exact intent', async () => {
    let count = 0
    onBook = () => {
      if (count++ === 0) {
        profile.profileState = 'ESTABLISHED'
        return Response.json(
          { code: 'CUSTOMER_PROFILE_CHANGED' },
          { status: 409 },
        )
      }
      return ok(reservation)
    }
    const user = await mount()
    await chooseTime(user)
    await enterNames(user)
    await acceptQuote(user)
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    const acknowledgement = await screen.findByLabelText(
      /Rozumiem, że moje dane/,
    )
    expect(
      screen.getByRole('button', { name: 'Rezerwuję wizytę' }),
    ).toBeDisabled()
    expect(calls.filter((c) => c.path === '/api/reservations')).toHaveLength(1)
    await user.click(acknowledgement)
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    await screen.findByRole('heading', { name: 'Wizyta zarezerwowana' })
    const writes = calls.filter((c) => c.path === '/api/reservations')
    expect(new Headers(writes[1].init.headers).get('Idempotency-Key')).not.toBe(
      new Headers(writes[0].init.headers).get('Idempotency-Key'),
    )
    expect(
      JSON.parse(String(writes[1].init.body)).firstVisitDetails,
    ).toBeUndefined()
  })
  it.each([401, 403, 429, 409])(
    'retains unknown exact attempt after later HTTP %i and restores it across reload',
    async (status) => {
      let count = 0
      onBook = () => {
        count++
        if (count === 1) throw new TypeError('connection lost')
        return Response.json(
          {
            code: status === 409 ? 'SESSION_CONTEXT_CHANGED' : 'AUTH_OR_LIMIT',
          },
          { status },
        )
      }
      let user = await mount()
      await chooseTime(user)
      await enterNames(user)
      await acceptQuote(user)
      await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
      await user.click(
        await screen.findByRole('button', {
          name: 'Sprawdź wynik tego samego zgłoszenia',
        }),
      )
      await waitFor(() =>
        expect(
          calls.filter((c) => c.path === '/api/reservations'),
        ).toHaveLength(2),
      )
      const original = readAttempt(session)!
      expect(original.uncertain).toBe(true)
      cleanup()
      user = await mount()
      expect(
        await screen.findByRole('button', {
          name: 'Sprawdź wynik tego samego zgłoszenia',
        }),
      ).toBeEnabled()
      onBook = () => ok({ ...reservation, status: 'CANCELLED', archived: true })
      await user.click(
        screen.getByRole('button', {
          name: 'Sprawdź wynik tego samego zgłoszenia',
        }),
      )
      expect(
        await screen.findByRole('heading', { name: 'Wizyta anulowana' }),
      ).toBeVisible()
      const writes = calls.filter((c) => c.path === '/api/reservations')
      for (const write of writes) {
        expect(new Headers(write.init.headers).get('Idempotency-Key')).toBe(
          original.key,
        )
        expect(JSON.parse(String(write.init.body))).toEqual(original.body)
      }
    },
  )
  it('clears private drafts and quotes on scope change without replacing another account recovery', async () => {
    const user = await mount()
    await chooseTime(user)
    await enterNames(user)
    await acceptQuote(user)
    identity = { ...session, userId: other }
    profile = { ...profile, id: other, phoneNumber: '+48500999888' }
    await user.click(screen.getByRole('button', { name: 'Odśwież sesję' }))
    await waitFor(() => expect(screen.getByLabelText('Imię')).toHaveValue(''))
    expect(screen.getByLabelText('Nazwisko')).toHaveValue('')
    expect(
      screen.queryByLabelText(
        'Akceptuję powyższą cenę, czas trwania i termin.',
      ),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Dane formularza zostały usunięte',
    )
    expect(calls.filter((c) => c.path === '/api/reservations')).toHaveLength(0)
  })
  it('expires recovery into a support-only warning and never recreates a request from history', async () => {
    const attempt = {
      ...newAttempt(body, session),
      createdAt: Date.now() - RETENTION_MS - 1,
      uncertain: true,
    }
    saveAttempt(attempt)
    await mount()
    expect(await screen.findByText(/jego dane wygasły/)).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Rezerwuję wizytę' }),
    ).not.toBeInTheDocument()
    expect(sessionStorage.getItem(recoveryKey(ATTEMPT_KEY, session))).toBeNull()
    expect(calls.some((c) => c.path.includes('history'))).toBe(false)
  })
  it('logout erases recovery PII but preserves its account-scoped warning', async () => {
    saveAttempt({ ...newAttempt(body, session), uncertain: true })
    const user = await mount()
    await user.click(screen.getByRole('button', { name: 'Wyloguj' }))
    await screen.findByLabelText('Telefon z prefiksem kraju')
    expect(readAttempt(session)).toBeNull()
    expect(hasUnresolved(session)).toBe(true)
    expect(sessionStorage.getItem(recoveryKey(ATTEMPT_KEY, session))).toBeNull()
  })
  it.each(['ROLE_OWNER', 'ROLE_EMPLOYEE'])(
    'handles an existing %s session explicitly',
    async (role) => {
      identity = { ...session, employmentId: employee, authorities: [role] }
      await mount()
      expect(screen.getByText(/Aktywna sesja należy/)).toBeVisible()
      expect(screen.queryByLabelText('Imię')).not.toBeInTheDocument()
      expect(calls.some((c) => c.path === '/api/users/me')).toBe(false)
    },
  )
  it('handles missing service mapping and absent booking configuration', async () => {
    render(<ReservationPage company="" />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'nie jest jeszcze skonfigurowana',
    )
    cleanup()
    render(
      <ReservationPage company={company} initialService="service-no-mapping" />,
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'nie ma aktywnego powiązania',
    )
    expect(screen.getByLabelText('Usługa')).toHaveValue('')
  })
  it('rejects missing names, invalid email, expired quotes, and requires explicit phone confirmation', async () => {
    const user = await mount()
    await chooseTime(user)
    await acceptQuote(user)
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Uzupełnij imię i nazwisko',
    )
    await enterNames(user)
    await user.type(screen.getByLabelText('E-mail (opcjonalnie)'), 'invalid')
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    expect(screen.getByRole('alert')).toHaveTextContent('poprawny adres e-mail')
    quoteExpires = new Date(Date.now() - 1000).toISOString()
    await user.click(
      screen.getByRole('button', { name: 'Pobierz aktualną ofertę' }),
    )
    expect(
      await screen.findByText('Oferta wygasła. Pobierz aktualną ofertę.'),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Rezerwuję wizytę' }),
    ).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Wyloguj' }))
    await user.click(screen.getByRole('button', { name: 'Wyślij kod SMS' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Podaj pełny numer')
    expect(calls.filter((c) => c.path === '/api/reservations')).toHaveLength(0)
  })
  it('requires new terms after slot loss or quote reconfirmation', async () => {
    onBook = () =>
      Response.json({ code: 'QUOTE_RECONFIRMATION_REQUIRED' }, { status: 409 })
    const user = await mount()
    await chooseTime(user)
    await enterNames(user)
    await acceptQuote(user)
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Oferta wygasła')
    expect(
      screen.queryByLabelText(
        'Akceptuję powyższą cenę, czas trwania i termin.',
      ),
    ).not.toBeInTheDocument()
    expect(readAttempt(session)).toBeNull()
  })
  it('keeps a current cancelled replay distinct from a new confirmation', async () => {
    saveAttempt({ ...newAttempt(body, session), uncertain: true })
    onBook = () => ok({ ...reservation, status: 'CANCELLED' })
    const user = await mount()
    await user.click(
      await screen.findByRole('button', {
        name: 'Sprawdź wynik tego samego zgłoszenia',
      }),
    )
    expect(
      within(
        await screen.findByRole('region', { name: 'Wynik rezerwacji' }),
      ).getByText(/Status: Anulowana/),
    ).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Wizyta zarezerwowana' }),
    ).not.toBeInTheDocument()
  })
  it('does not turn a committed response into failure when storage cleanup throws', async () => {
    const user = await mount()
    await chooseTime(user)
    await enterNames(user)
    await acceptQuote(user)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage denied')
    })
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    expect(
      await screen.findByRole('heading', { name: 'Wizyta zarezerwowana' }),
    ).toBeVisible()
    expect(screen.queryByText(/Nie udało się połączyć/)).not.toBeInTheDocument()
  })
  it('applies confirmed logout even when local recovery cleanup throws', async () => {
    const user = await mount()
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage denied')
    })
    await user.click(screen.getByRole('button', { name: 'Wyloguj' }))
    expect(
      await screen.findByLabelText('Telefon z prefiksem kraju'),
    ).toBeVisible()
  })
  it('does not dispatch a booking when exact recovery cannot be retained', async () => {
    const user = await mount()
    await chooseTime(user)
    await enterNames(user)
    await acceptQuote(user)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    await user.click(screen.getByRole('button', { name: 'Rezerwuję wizytę' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Rezerwacja nie została wysłana',
    )
    expect(calls.filter((c) => c.path === '/api/reservations')).toHaveLength(0)
  })
  it('expires a mounted unknown attempt without waiting for page reload', async () => {
    saveAttempt({ ...newAttempt(body, session), uncertain: true })
    await mount()
    await screen.findByRole('button', {
      name: 'Sprawdź wynik tego samego zgłoszenia',
    })
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + RETENTION_MS + 100)
    expect(
      await screen.findByText(/jego dane wygasły/, {}, { timeout: 2500 }),
    ).toBeVisible()
    expect(sessionStorage.getItem(recoveryKey(ATTEMPT_KEY, session))).toBeNull()
  })
})
