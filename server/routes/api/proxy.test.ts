// @vitest-environment node
import { H3 } from 'nitro/h3'
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from './[...path]'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})
describe('request-local Spring relay', () => {
  it.each([
    undefined,
    'not a URL',
    'https://user:password@example.test',
    'ftp://example.test',
    'https://example.test/path',
    'https://example.test?redirect=bad',
    'https://example.test/#bad',
  ])('fails closed for invalid upstream %s', async (origin) => {
    vi.stubEnv('SCHEDULER_API_ORIGIN', origin)
    const app = new H3().all('/api/**', handler)
    expect((await app.request('/api/auth/me')).status).toBe(503)
  })
  it('isolates browser cookies and Set-Cookie, forwards context/CSRF/body, strips forged IP headers and prevents caching', async () => {
    vi.stubEnv('SCHEDULER_API_ORIGIN', 'http://scheduler.internal:8080')
    const upstream = vi
      .fn<typeof fetch>()
      .mockImplementation(async (url, init) => {
        expect(String(url)).toBe(
          'http://scheduler.internal:8080/api/reservations?view=current',
        )
        const headers = new Headers(init?.headers)
        for (const name of [
          'forwarded',
          'x-forwarded-for',
          'x-forwarded-host',
          'x-forwarded-proto',
          'x-real-ip',
          'cf-connecting-ip',
        ])
          expect(headers.has(name)).toBe(false)
        expect(headers.get('X-XSRF-TOKEN')).toBe('csrf')
        expect(headers.get('X-Expected-Session-Context')).toBe(
          'original-context',
        )
        expect(headers.get('Idempotency-Key')).toBe('original-key')
        expect(init?.redirect).toBe('manual')
        const outgoing = new Headers({ 'Cache-Control': 'public,max-age=3600' })
        outgoing.append(
          'Set-Cookie',
          `${headers.get('cookie')}; HttpOnly; Path=/; SameSite=Lax`,
        )
        outgoing.append('Set-Cookie', 'XSRF-TOKEN=new; Path=/')
        return new Response('committed', { status: 201, headers: outgoing })
      })
    vi.stubGlobal('fetch', upstream)
    const app = new H3().all('/api/**', handler)
    const responses = await Promise.all(
      ['SESSION=one', 'SESSION=two'].map((cookie) =>
        app.request('/api/reservations?view=current', {
          method: 'POST',
          headers: {
            cookie,
            'X-XSRF-TOKEN': 'csrf',
            'X-Expected-Session-Context': 'original-context',
            'Idempotency-Key': 'original-key',
            Forwarded: 'for=evil',
            'X-Forwarded-For': '1.2.3.4',
            'X-Forwarded-Host': 'evil',
            'X-Forwarded-Proto': 'https',
            'X-Real-IP': '1.2.3.4',
            'CF-Connecting-IP': '1.2.3.4',
          },
          body: 'original-body',
        }),
      ),
    )
    for (const [i, response] of responses.entries()) {
      expect(response.status).toBe(201)
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      expect(response.headers.getSetCookie()).toEqual([
        `SESSION=${i === 0 ? 'one' : 'two'}; HttpOnly; Path=/; SameSite=Lax`,
        'XSRF-TOKEN=new; Path=/',
      ])
      expect(await response.text()).toBe('committed')
    }
    expect(upstream).toHaveBeenCalledTimes(2)
  })
})
