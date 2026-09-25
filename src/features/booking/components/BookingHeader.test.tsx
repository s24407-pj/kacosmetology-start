import '@testing-library/jest-dom/vitest'
import { CustomerAuthProvider } from '@features/booking/hooks/useCustomerAuth'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BookingHeader from './BookingHeader'

describe('BookingHeader', () => {
  afterEach(() => {
    cleanup()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CustomerAuthProvider>{children}</CustomerAuthProvider>
  )

  it('renders mode tabs and calls onViewModeChange when clicked', () => {
    const handleModeChange = vi.fn()
    render(
      <BookingHeader
        viewMode="wizard"
        onViewModeChange={handleModeChange}
        currentStep="service"
      />,
      { wrapper },
    )

    const myVisitsTab = screen.getByRole('tab', { name: /Moje wizyty/i })
    fireEvent.click(myVisitsTab)
    expect(handleModeChange).toHaveBeenCalledWith('my-reservations')
  })

  it('renders stepper steps in wizard mode', () => {
    render(
      <BookingHeader
        viewMode="wizard"
        onViewModeChange={vi.fn()}
        currentStep="datetime"
      />,
      { wrapper },
    )

    expect(screen.getByText('Wybór zabiegu')).toBeInTheDocument()
    expect(screen.getByText('Wybór specjalisty')).toBeInTheDocument()
    expect(screen.getByText('Termin wizyty')).toBeInTheDocument()
  })

  it('hides stepper in my-reservations mode', () => {
    render(
      <BookingHeader
        viewMode="my-reservations"
        onViewModeChange={vi.fn()}
        currentStep="service"
      />,
      { wrapper },
    )

    expect(screen.queryByLabelText('Kroki rezerwacji')).not.toBeInTheDocument()
  })
})
