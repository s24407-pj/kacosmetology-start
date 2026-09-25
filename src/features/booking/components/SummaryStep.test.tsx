import '@testing-library/jest-dom/vitest'
import { CustomerAuthProvider } from '@features/booking/hooks/useCustomerAuth'
import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
} from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SummaryStep from './SummaryStep'

describe('SummaryStep', () => {
  afterEach(() => {
    cleanup()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CustomerAuthProvider>{children}</CustomerAuthProvider>
  )

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
    lastName: 'Suwalska',
  }

  const mockSlot: AvailableSlot = {
    time: '10:00:00',
    price: 200,
    originalPrice: 200,
  }

  it('renders summary receipt with service, specialist, and price', () => {
    render(
      <SummaryStep
        offering={mockOffering}
        employee={mockEmployee}
        date="2026-10-15"
        slot={mockSlot}
        isSubmitting={false}
        error={null}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
      />,
      { wrapper },
    )

    expect(screen.getByText('Oczyszczanie wodorowe')).toBeInTheDocument()
    expect(screen.getByText('Katarzyna Suwalska')).toBeInTheDocument()
    expect(screen.getByText('200 zł')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Potwierdzam rezerwację/i }),
    ).toBeInTheDocument()
  })

  it('calls onSubmit when confirm button is clicked', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <SummaryStep
        offering={mockOffering}
        employee={mockEmployee}
        date="2026-10-15"
        slot={mockSlot}
        isSubmitting={false}
        error={null}
        onSubmit={handleSubmit}
        onBack={vi.fn()}
      />,
      { wrapper },
    )

    fireEvent.click(
      screen.getByRole('button', { name: /Potwierdzam rezerwację/i }),
    )
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('renders error message when error prop is provided', () => {
    render(
      <SummaryStep
        offering={mockOffering}
        employee={mockEmployee}
        date="2026-10-15"
        slot={mockSlot}
        isSubmitting={false}
        error="Wybrany termin został już zajęty."
        onSubmit={vi.fn()}
        onBack={vi.fn()}
      />,
      { wrapper },
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Wybrany termin został już zajęty.',
    )
  })
})
