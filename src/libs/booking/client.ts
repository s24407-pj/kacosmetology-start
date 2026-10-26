import type { Session } from './contracts'
import { sessionContext } from './policy'

export class BookingError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(code)
  }
}
/** Per-page instance: no SSR-wide cookie jar or token, no automatic write retries. */
export class BookingClient {
  private token?: string
  constructor(private readonly fetcher: typeof fetch = globalThis.fetch) {}
  invalidate() {
    this.token = undefined
  }
  async request<T>(
    path: string,
    options: {
      method?: string
      body?: unknown
      session?: Session
      key?: string
    } = {},
  ): Promise<T> {
    const method = options.method ?? 'GET'
    const headers = new Headers({ Accept: 'application/json' })
    if (method !== 'GET') {
      if (!this.token) {
        const csrf = await this.request<{ token: string }>('/api/auth/csrf')
        this.token = csrf.token
      }
      headers.set('X-XSRF-TOKEN', this.token)
      headers.set('Content-Type', 'application/json')
      if (options.session)
        headers.set(
          'X-Expected-Session-Context',
          sessionContext(options.session),
        )
      if (options.key) headers.set('Idempotency-Key', options.key)
    }
    // Native browser fetch rejects a class instance as its receiver.
    const fetchRequest = this.fetcher
    const response = await fetchRequest(path, {
      method,
      headers,
      credentials: 'same-origin',
      cache: 'no-store',
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    if (response.status === 403) this.invalidate()
    if (!response.ok) {
      const raw = await response.json().catch(() => null)
      const problem = raw && typeof raw === 'object' ? raw : {}
      const retryAfter = response.headers.get('Retry-After')
      const delay = retryAfter
        ? /^\d+$/.test(retryAfter)
          ? Number(retryAfter)
          : Math.max(0, Math.ceil((Date.parse(retryAfter) - Date.now()) / 1000))
        : undefined
      throw new BookingError(
        response.status,
        typeof problem.code === 'string'
          ? problem.code
          : `HTTP_${response.status}`,
        Number.isFinite(delay) ? delay : undefined,
      )
    }
    return response.status === 204
      ? (undefined as T)
      : (response.json() as Promise<T>)
  }
}
export function errorMessage(error: unknown): string {
  if (!(error instanceof BookingError))
    return 'Nie udało się połączyć. Jeśli wysłano rezerwację, jej wynik pozostaje nieznany. Zachowaj zgłoszenie i sprawdź je ponownie.'
  const messages: Record<string, string> = {
    CUSTOMER_PROFILE_CHANGED:
      'Kartoteka została uzupełniona w międzyczasie. Podane tutaj dane nie zostały zapisane. Przed dalszą rezerwacją potwierdź powiązanie z kartoteką dla tego telefonu lub skontaktuj się z salonem.',
    CUSTOMER_BLOCKED:
      'Rezerwacja online jest niedostępna dla tej kartoteki. Skontaktuj się z salonem.',
    INVALID_OTP:
      'Kod jest nieprawidłowy lub wygasł. Sprawdź kod albo poproś o nowy.',
    SLOT_UNAVAILABLE: 'Termin jest już niedostępny. Wybierz inny termin.',
    CUSTOMER_NAME_REQUIRED: 'Uzupełnij imię i nazwisko na pierwszą wizytę.',
    SESSION_CONTEXT_CHANGED:
      'Konto lub salon zmieniły się w innej karcie. Przywróć właściwe konto przed ponowieniem.',
    QUOTE_RECONFIRMATION_REQUIRED:
      'Oferta wygasła. Pobierz aktualną cenę i zaakceptuj ją ponownie.',
    IDEMPOTENCY_CONFLICT:
      'To zgłoszenie jest powiązane z innymi danymi. Skontaktuj się z salonem, zanim utworzysz kolejną rezerwację.',
    IDEMPOTENCY_IN_PROGRESS:
      'Zgłoszenie jest przetwarzane. Ponów sprawdzenie tego samego zgłoszenia.',
  }
  return (
    messages[error.code] ??
    (error.status === 401
      ? 'Sesja wygasła. Potwierdź ponownie ten sam telefon, aby sprawdzić zachowane zgłoszenie.'
      : error.status === 403
        ? 'Brak dostępu lub sesja bezpieczeństwa wygasła. Odśwież sesję i sprawdź zachowane zgłoszenie.'
        : error.status === 429
          ? 'Zbyt wiele prób. Odczekaj i ponów to samo zgłoszenie.'
          : 'Nie udało się wykonać operacji. Sprawdź dane lub skontaktuj się z salonem.')
  )
}
