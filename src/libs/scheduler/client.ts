export class SchedulerClientError extends Error {
  readonly status: number
  readonly userMessage: string
  readonly details?: Record<string, string>

  constructor(
    status: number,
    userMessage: string,
    details?: Record<string, string>,
  ) {
    super(userMessage)
    this.name = 'SchedulerClientError'
    this.status = status
    this.userMessage = userMessage
    this.details = details
  }
}

export interface RequestOptions extends RequestInit {
  token?: string | null
  timeoutMs?: number
}

export function getSchedulerBaseUrl(): string {
  if (typeof window !== 'undefined' && import.meta.env.VITE_SCHEDULER_API_URL) {
    return import.meta.env.VITE_SCHEDULER_API_URL.replace(/\/+$/, '')
  }
  return 'http://localhost:8080'
}

export function mapStatusToUserMessage(
  status: number,
  message?: string,
): string {
  if (message && message.trim().length > 0) {
    return message
  }
  switch (status) {
    case 400:
      return 'Nieprawidłowe dane zgłoszenia. Sprawdź wprowadzone informacje.'
    case 401:
      return 'Sesja wygasła lub kod jest nieprawidłowy. Zaloguj się ponownie.'
    case 403:
      return 'Brak uprawnień do wykonania tej operacji.'
    case 404:
      return 'Nie znaleziono żądanego zasobu lub usługa jest niedostępna.'
    case 409:
      return 'Wybrany termin został już zarezerwowany. Wybierz inną godzinę.'
    case 429:
      return 'Zbyt wiele prób w krótkim czasie. Odczekaj chwilę przed kolejną próbą.'
    default:
      return 'Nie udało się połączyć z systemem rezerwacji. Spróbuj ponownie lub zadzwoń do salonu.'
  }
}

export async function schedulerFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = getSchedulerBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`

  const {
    token,
    timeoutMs = 10000,
    headers: customHeaders,
    ...restOptions
  } = options

  const headers = new Headers(customHeaders)
  if (!headers.has('Content-Type') && restOptions.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      let rawMessage = ''
      let details: Record<string, string> | undefined

      try {
        const errorJson = await response.json()
        if (typeof errorJson === 'object' && errorJson !== null) {
          rawMessage = errorJson.message || errorJson.error || ''
          if (errorJson.errors && typeof errorJson.errors === 'object') {
            details = errorJson.errors
          }
        }
      } catch {
        // Response was not JSON
      }

      const userMessage = mapStatusToUserMessage(response.status, rawMessage)
      throw new SchedulerClientError(response.status, userMessage, details)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (err) {
    if (err instanceof SchedulerClientError) {
      throw err
    }

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new SchedulerClientError(
        408,
        'Przekroczono czas oczekiwania na odpowiedź serwera rezerwacji.',
      )
    }

    throw new SchedulerClientError(
      0,
      'Brak połączenia z systemem rezerwacji. Skontaktuj się z salonem telefonicznie.',
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
