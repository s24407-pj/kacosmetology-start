import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  mapStatusToUserMessage,
  SchedulerClientError,
  schedulerFetch,
} from './client'

describe('scheduler client', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('maps standard HTTP error codes to Polish user messages', () => {
    expect(mapStatusToUserMessage(400)).toContain('Nieprawidłowe dane')
    expect(mapStatusToUserMessage(401)).toContain('Sesja wygasła')
    expect(mapStatusToUserMessage(403)).toContain('Brak uprawnień')
    expect(mapStatusToUserMessage(404)).toContain('Nie znaleziono')
    expect(mapStatusToUserMessage(409)).toContain(
      'Wybrany termin został już zarezerwowany',
    )
    expect(mapStatusToUserMessage(429)).toContain('Zbyt wiele prób')
    expect(mapStatusToUserMessage(500)).toContain('Nie udało się połączyć')
    expect(mapStatusToUserMessage(400, 'Niestandardowy błąd')).toBe(
      'Niestandardowy błąd',
    )
  })

  it('performs successful GET request and parses JSON', async () => {
    const mockData = { id: 1, name: 'Ka.Cosmetology' }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const result = await schedulerFetch<{ id: number; name: string }>(
      '/api/company/public/1',
    )
    expect(result).toEqual(mockData)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/company/public/1',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
  })

  it('attaches Authorization header when token is supplied', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 5 }),
    })

    await schedulerFetch('/api/users/me', { token: 'jwt-token-xyz' })
    const lastCall = vi.mocked(globalThis.fetch).mock.calls[0]
    const headers = lastCall[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer jwt-token-xyz')
  })

  it('throws SchedulerClientError with server message on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Termin zajęty' }),
    })

    await expect(schedulerFetch('/api/reservations')).rejects.toThrow(
      SchedulerClientError,
    )
    await expect(schedulerFetch('/api/reservations')).rejects.toThrow(
      'Termin zajęty',
    )
  })

  it('handles 204 No Content returning undefined', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('No body')
      },
    })

    const result = await schedulerFetch<void>('/api/reservations/10/cancel', {
      method: 'PATCH',
    })
    expect(result).toBeUndefined()
  })

  it('handles network failure gracefully', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(schedulerFetch('/api/availability')).rejects.toThrow(
      'Brak połączenia z systemem rezerwacji. Skontaktuj się z salonem telefonicznie.',
    )
  })
})
