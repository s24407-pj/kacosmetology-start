import '@testing-library/jest-dom/vitest'
import type {
  PublicEmployee,
  PublicOffering,
  ReservationResponse,
} from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConfirmationStep from './ConfirmationStep'

describe('ConfirmationStep', () => {
  afterEach(() => {
    cleanup()
  })

  const mockOffering: PublicOffering = {
    id: 1,
    companyId: 1,
    name: 'Oczyszczanie wodorowe',
    durationMinutes: 60,
    price: 200,
    active: true,
    categoryId: 3,
  }

  const mockEmployee: PublicEmployee = {
    id: 1,
    firstName: 'Katarzyna',
  }

  const mockReservation: ReservationResponse = {
    id: 42,
    employeeId: 1,
    serviceId: 1,
    price: 200,
    startTime: '2026-10-15T10:00:00',
    endTime: '2026-10-15T11:00:00',
    status: 'CONFIRMED',
  }

  it('renders confirmation details and actions', () => {
    const handleViewReservations = vi.fn()
    const handleNewBooking = vi.fn()

    render(
      <ConfirmationStep
        reservation={mockReservation}
        offering={mockOffering}
        employee={mockEmployee}
        onViewMyReservations={handleViewReservations}
        onNewBooking={handleNewBooking}
      />,
    )

    expect(
      screen.getByText('Wizyta została zarezerwowana!'),
    ).toBeInTheDocument()
    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText('Oczyszczanie wodorowe')).toBeInTheDocument()

    // Test action clicks
    fireEvent.click(screen.getByText('Przejdź do moich wizyt'))
    expect(handleViewReservations).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Zarezerwuj kolejną wizytę'))
    expect(handleNewBooking).toHaveBeenCalledTimes(1)
  })
})
