import { describe, expect, it, vi } from 'vitest'
import { BookingClient, BookingError, errorMessage } from './client'

const session = {
  userId: 'user',
  companyId: 'company',
  employmentId: null,
  authorities: ['ROLE_CUSTOMER'],
  username: 'phone',
}
describe('browser session transport', () => {
  it('calls native-style fetch without binding it to the client instance', async () => {
    const fetcher = vi.fn(function (this: unknown) {
      expect(this).toBeUndefined()
      return Promise.resolve(Response.json({ userId: 'user' }))
    })
    await expect(
      new BookingClient(fetcher).request('/api/auth/me'),
    ).resolves.toEqual({ userId: 'user' })
  })
  it('refreshes CSRF, captures context and sends each write once with private no-store reads', async () => {
    const fetcher = vi.fn<typeof fetch>()
    fetcher
      .mockResolvedValueOnce(Response.json({ token: 'first' }))
      .mockResolvedValueOnce(
        Response.json({ code: 'FORBIDDEN' }, { status: 403 }),
      )
      .mockResolvedValueOnce(Response.json({ token: 'second' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const client = new BookingClient(fetcher)
    await expect(
      client.request('/api/reservations', {
        method: 'POST',
        session,
        key: 'key',
        body: { a: 1 },
      }),
    ).rejects.toMatchObject({ status: 403 })
    await client.request('/api/reservations', {
      method: 'POST',
      session,
      key: 'key',
      body: { a: 1 },
    })
    expect(fetcher).toHaveBeenCalledTimes(4)
    const init = fetcher.mock.calls[1][1]!
    expect(init.credentials).toBe('same-origin')
    expect(init.cache).toBe('no-store')
    const headers = new Headers(init.headers)
    expect(headers.get('X-Expected-Session-Context')).toBe(
      'v1:user:company:null:ROLE_CUSTOMER',
    )
    expect(headers.get('Idempotency-Key')).toBe('key')
    expect(headers.get('X-XSRF-TOKEN')).toBe('first')
    expect(
      new Headers(fetcher.mock.calls[3][1]?.headers).get('X-XSRF-TOKEN'),
    ).toBe('second')
  })
  it('preserves server rate-limit delay and handles non-JSON errors', async () => {
    const client = new BookingClient(
      vi.fn<typeof fetch>().mockResolvedValueOnce(
        new Response('unavailable', {
          status: 429,
          headers: { 'Retry-After': '60' },
        }),
      ),
    )
    await expect(client.request('/api/auth/me')).rejects.toMatchObject({
      status: 429,
      code: 'HTTP_429',
      retryAfterSeconds: 60,
    })
    expect(errorMessage(new BookingError(429, 'HTTP_429'))).toContain(
      'Odczekaj',
    )
    expect(errorMessage(new BookingError(401, 'HTTP_401'))).toContain(
      'ten sam telefon',
    )
    expect(errorMessage(new BookingError(403, 'HTTP_403'))).toContain(
      'Brak dostępu',
    )
    expect(errorMessage(new TypeError())).toContain('nieznany')
    for (const code of [
      'CUSTOMER_PROFILE_CHANGED',
      'CUSTOMER_BLOCKED',
      'INVALID_OTP',
      'SLOT_UNAVAILABLE',
      'CUSTOMER_NAME_REQUIRED',
      'SESSION_CONTEXT_CHANGED',
      'QUOTE_RECONFIRMATION_REQUIRED',
      'IDEMPOTENCY_CONFLICT',
      'IDEMPOTENCY_IN_PROGRESS',
    ])
      expect(errorMessage(new BookingError(409, code))).not.toBe(code)
  })
})
