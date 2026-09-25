import '@testing-library/jest-dom/vitest'
import * as api from '@libs/scheduler/api'
import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
} from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DateTimeStep from './DateTimeStep'

describe('DateTimeStep', () => {
  const mockEmployee: PublicEmployee = {
    id: 1,
    firstName: 'Katarzyna',
  }

  const mockOffering: PublicOffering = {
    id: 10,
    companyId: 1,
    name: 'Oczyszczanie wodorowe',
    durationMinutes: 60,
    price: 200,
    active: true,
    categoryId: 3,
  }

  const mockSlots: AvailableSlot[] = [
    { time: '10:00:00', price: 200, originalPrice: 200 },
    { time: '12:00:00', price: 160, originalPrice: 200 }, // with discount
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'fetchAvailableSlots').mockResolvedValue(mockSlots)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders calendar and loads slots for selected date', async () => {
    const handleSelectSlot = vi.fn()
    render(
      <DateTimeStep
        employee={mockEmployee}
        offering={mockOffering}
        selectedDate="2026-10-15"
        selectedSlot={null}
        onSelectDate={vi.fn()}
        onSelectSlot={handleSelectSlot}
        onBack={vi.fn()}
      />,
    )

    await vi.waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument()
      expect(screen.getByText('12:00')).toBeInTheDocument()
    })

    // Last-minute discount badge
    expect(screen.getByText(/Last minute/i)).toBeInTheDocument()
    expect(screen.getByText('160 zł')).toBeInTheDocument()

    // Click slot
    fireEvent.click(screen.getByText('10:00').closest('button')!)
    expect(handleSelectSlot).toHaveBeenCalledWith(mockSlots[0])
  })

  it('calls onBack when back button is clicked', () => {
    const handleBack = vi.fn()
    render(
      <DateTimeStep
        employee={mockEmployee}
        offering={mockOffering}
        selectedDate="2026-10-15"
        selectedSlot={null}
        onSelectDate={vi.fn()}
        onSelectSlot={vi.fn()}
        onBack={handleBack}
      />,
    )

    fireEvent.click(screen.getByText('Zmień specjalistę'))
    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})
