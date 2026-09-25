import '@testing-library/jest-dom/vitest'
import {
  CUSTOMER_TOKEN_STORAGE_KEY,
  CustomerAuthProvider,
} from '@features/booking/hooks/useCustomerAuth'
import * as api from '@libs/scheduler/api'
import type { PublicOffering, ReservationResponse } from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CustomerReservations from './CustomerReservations'

describe('CustomerReservations', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CustomerAuthProvider>{children}</CustomerAuthProvider>
  )

  const mockOfferings: PublicOffering[] = [
    {
      id: 1,
      companyId: 1,
      name: 'Oczyszczanie wodorowe',
      durationMinutes: 60,
      price: 200,
      active: true,
      categoryId: 3,
    },
  ]

  const mockReservations: ReservationResponse[] = [
    {
      id: 101,
      employeeId: 1,
      serviceId: 1,
      price: 200,
      startTime: '2099-10-15T10:00:00', // future
      endTime: '2099-10-15T11:00:00',
      status: 'CONFIRMED',
    },
  ]

  it('renders login prompt when customer is unauthenticated', () => {
    render(
      <CustomerReservations offerings={mockOfferings} onNewBooking={vi.fn()} />,
      { wrapper },
    )

    expect(
      screen.getByText(/Zaloguj się swoim numerem telefonu/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Numer telefonu')).toBeInTheDocument()
  })

  it('loads and displays upcoming reservations for authenticated customer', async () => {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, 'test-jwt')
    vi.spyOn(api, 'fetchMyProfile').mockResolvedValue({
      id: 1,
      phoneNumber: '+48726154460',
      firstName: 'Anna',
      lastName: 'Kowalska',
    })
    vi.spyOn(api, 'fetchMyReservations').mockResolvedValue(mockReservations)

    render(
      <CustomerReservations offerings={mockOfferings} onNewBooking={vi.fn()} />,
      { wrapper },
    )

    await vi.waitFor(() => {
      expect(screen.getByText('Oczyszczanie wodorowe')).toBeInTheDocument()
      expect(screen.getByText('Potwierdzona')).toBeInTheDocument()
      expect(screen.getByText('Odwołaj wizytę')).toBeInTheDocument()
    })
  })

  it('opens cancellation dialog and cancels reservation on confirmation', async () => {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, 'test-jwt')
    vi.spyOn(api, 'fetchMyProfile').mockResolvedValue({
      id: 1,
      phoneNumber: '+48726154460',
      firstName: 'Anna',
      lastName: 'Kowalska',
    })
    vi.spyOn(api, 'fetchMyReservations').mockResolvedValue(mockReservations)
    vi.spyOn(api, 'cancelReservation').mockResolvedValue(undefined)

    render(
      <CustomerReservations offerings={mockOfferings} onNewBooking={vi.fn()} />,
      { wrapper },
    )

    await vi.waitFor(() => {
      expect(screen.getByText('Odwołaj wizytę')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Odwołaj wizytę'))

    // Dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText(/Czy na pewno chcesz odwołać wizytę/i),
    ).toBeInTheDocument()

    // Confirm cancel
    fireEvent.click(screen.getByText('Tak, odwołaj wizytę'))

    await vi.waitFor(() => {
      expect(api.cancelReservation).toHaveBeenCalledWith('test-jwt', 101)
    })
  })
})
