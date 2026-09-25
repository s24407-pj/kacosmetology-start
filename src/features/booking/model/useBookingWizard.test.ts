import * as api from '@libs/scheduler/api'
import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
  ReservationResponse,
} from '@libs/scheduler/types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBookingWizard } from './useBookingWizard'

describe('useBookingWizard', () => {
  const mockOffering: PublicOffering = {
    id: 10,
    companyId: 1,
    name: 'Oczyszczanie wodorowe',
    durationMinutes: 60,
    price: 200,
    active: true,
    categoryId: 1,
  }

  const mockEmployee: PublicEmployee = {
    id: 3,
    firstName: 'Katarzyna',
  }

  const mockSlot: AvailableSlot = {
    time: '10:00:00',
    price: 200,
    originalPrice: 200,
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes at service step with empty selections', () => {
    const { result } = renderHook(() => useBookingWizard({ token: null }))
    expect(result.current.step).toBe('service')
    expect(result.current.selectedOffering).toBeNull()
  })

  it('advances through steps on selections when unauthenticated', () => {
    const { result } = renderHook(() => useBookingWizard({ token: null }))

    act(() => {
      result.current.selectOffering(mockOffering)
    })
    expect(result.current.step).toBe('specialist')
    expect(result.current.selectedOffering).toEqual(mockOffering)

    act(() => {
      result.current.selectEmployee(mockEmployee)
    })
    expect(result.current.step).toBe('datetime')
    expect(result.current.selectedEmployee).toEqual(mockEmployee)

    act(() => {
      result.current.selectDate('2026-10-15')
    })
    expect(result.current.selectedDate).toBe('2026-10-15')

    act(() => {
      result.current.selectSlot(mockSlot)
    })
    // Since token is null, goes to auth
    expect(result.current.step).toBe('auth')

    act(() => {
      result.current.onAuthComplete()
    })
    expect(result.current.step).toBe('summary')
  })

  it('skips auth step to summary when already authenticated with token', () => {
    const { result } = renderHook(() =>
      useBookingWizard({ token: 'mock-jwt-token' }),
    )

    act(() => {
      result.current.selectOffering(mockOffering)
      result.current.selectEmployee(mockEmployee)
      result.current.selectDate('2026-10-15')
      result.current.selectSlot(mockSlot)
    })

    expect(result.current.step).toBe('summary')
  })

  it('allows navigation back through previous steps', () => {
    const { result } = renderHook(() =>
      useBookingWizard({ token: 'mock-jwt-token' }),
    )

    act(() => {
      result.current.selectOffering(mockOffering)
      result.current.selectEmployee(mockEmployee)
    })
    expect(result.current.step).toBe('datetime')

    act(() => {
      result.current.goBack()
    })
    expect(result.current.step).toBe('specialist')

    act(() => {
      result.current.goBack()
    })
    expect(result.current.step).toBe('service')
  })

  it('submits reservation and moves to confirmation on success', async () => {
    const mockReservation: ReservationResponse = {
      id: 55,
      employeeId: 3,
      serviceId: 10,
      price: 200,
      startTime: '2026-10-15T10:00:00',
      endTime: '2026-10-15T11:00:00',
      status: 'CONFIRMED',
    }

    vi.spyOn(api, 'createReservation').mockResolvedValue(mockReservation)

    const { result } = renderHook(() =>
      useBookingWizard({ token: 'mock-token' }),
    )

    act(() => {
      result.current.selectOffering(mockOffering)
      result.current.selectEmployee(mockEmployee)
      result.current.selectDate('2026-10-15')
      result.current.selectSlot(mockSlot)
    })

    await act(async () => {
      await result.current.submitReservation()
    })

    expect(result.current.step).toBe('confirmation')
    expect(result.current.createdReservation?.id).toBe(55)
    expect(result.current.error).toBeNull()
  })

  it('sets error when submission fails', async () => {
    vi.spyOn(api, 'createReservation').mockRejectedValue(
      new Error('Termin zajęty'),
    )

    const { result } = renderHook(() =>
      useBookingWizard({ token: 'mock-token' }),
    )

    act(() => {
      result.current.selectOffering(mockOffering)
      result.current.selectEmployee(mockEmployee)
      result.current.selectDate('2026-10-15')
      result.current.selectSlot(mockSlot)
    })

    await act(async () => {
      await result.current.submitReservation()
    })

    expect(result.current.error).toBe('Termin zajęty')
    expect(result.current.step).toBe('summary')
  })
})
