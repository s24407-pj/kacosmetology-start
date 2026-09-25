import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cancelReservation,
  createReservation,
  fetchAvailableSlots,
  fetchMyProfile,
  fetchMyReservations,
  fetchPublicCompanyProfile,
  fetchPublicEmployees,
  fetchPublicOfferings,
  requestAuthCode,
  verifyAuthCode,
} from './api'

describe('scheduler api functions', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('fetchPublicCompanyProfile calls correct endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, name: 'Ka.Cosmetology' }),
    })

    const profile = await fetchPublicCompanyProfile(1)
    expect(profile.name).toBe('Ka.Cosmetology')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/company/public/1',
      expect.anything(),
    )
  })

  it('fetchPublicEmployees attaches offeringId when provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 10, firstName: 'Katarzyna' }],
    })

    const employees = await fetchPublicEmployees(1, 42)
    expect(employees).toHaveLength(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/employees/public/company/1?offeringId=42',
      expect.anything(),
    )
  })

  it('fetchPublicOfferings calls offerings endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 1, name: 'Oczyszczanie wodorowe', price: 200 }],
    })

    const offerings = await fetchPublicOfferings(1)
    expect(offerings[0].name).toBe('Oczyszczanie wodorowe')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/offerings/public/company/1',
      expect.anything(),
    )
  })

  it('fetchAvailableSlots queries correct parameters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ time: '10:00:00', price: 180, originalPrice: 200 }],
    })

    const slots = await fetchAvailableSlots(2, 5, '2026-10-01')
    expect(slots).toHaveLength(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/availability?employeeId=2&serviceId=5&date=2026-10-01',
      expect.anything(),
    )
  })

  it('requestAuthCode posts phone number', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Kod wysłany!' }),
    })

    const res = await requestAuthCode('+48726154460')
    expect(res.message).toBe('Kod wysłany!')
    const body = JSON.parse(
      vi.mocked(globalThis.fetch).mock.calls[0][1]?.body as string,
    )
    expect(body.phoneNumber).toBe('+48726154460')
  })

  it('verifyAuthCode posts verification payload', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'mock-jwt-token' }),
    })

    const res = await verifyAuthCode({
      phoneNumber: '+48726154460',
      code: '123456',
      firstName: 'Katarzyna',
      lastName: 'Suwalska',
    })
    expect(res.token).toBe('mock-jwt-token')
  })

  it('fetchMyProfile returns authenticated customer info', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 7,
        phoneNumber: '+48726154460',
        firstName: 'Anna',
        lastName: 'Kowalska',
      }),
    })

    const profile = await fetchMyProfile('token-123')
    expect(profile.id).toBe(7)
    expect(profile.firstName).toBe('Anna')
  })

  it('createReservation posts reservation details with token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 99, status: 'CONFIRMED' }),
    })

    const res = await createReservation('token-123', {
      employeeId: 2,
      serviceId: 5,
      startTime: '2026-10-01T10:00:00',
    })
    expect(res.id).toBe(99)
  })

  it('fetchMyReservations and cancelReservation work as expected', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 99, status: 'CONFIRMED' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

    const reservations = await fetchMyReservations('token-123')
    expect(reservations).toHaveLength(1)

    await cancelReservation('token-123', 99)
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      'http://localhost:8080/api/reservations/99/cancel',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})
