import '@testing-library/jest-dom/vitest'
import * as api from '@libs/scheduler/api'
import type { PublicOffering } from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookingPage from './BookingPage'

describe('BookingPage', () => {
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
    {
      id: 2,
      companyId: 1,
      name: 'Regulacja brwi',
      durationMinutes: 20,
      price: 30,
      active: true,
      categoryId: 1,
    },
  ]

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(api, 'fetchPublicOfferings').mockResolvedValue(mockOfferings)
    vi.spyOn(api, 'fetchPublicEmployees').mockResolvedValue([
      { id: 1, firstName: 'Katarzyna', role: 'OWNER' },
    ])
  })

  afterEach(() => {
    cleanup()
  })

  it('renders booking hero, tabs and offerings', async () => {
    render(<BookingPage />)

    expect(screen.getByText('Umów wizytę w salonie')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Nowa rezerwacja/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Moje wizyty/i }),
    ).toBeInTheDocument()

    // Waits for offerings to load
    await vi.waitFor(() => {
      expect(screen.getByText('Oczyszczanie wodorowe')).toBeInTheDocument()
    })
    expect(screen.getByText('Regulacja brwi')).toBeInTheDocument()
  })

  it('switches between wizard and my-reservations tabs', async () => {
    render(<BookingPage />)

    const myVisitsTab = screen.getByRole('tab', { name: /Moje wizyty/i })
    fireEvent.click(myVisitsTab)

    expect(screen.getByText('Moje rezerwacje')).toBeInTheDocument()
    expect(
      screen.getByText(/Zaloguj się swoim numerem telefonu/i),
    ).toBeInTheDocument()

    const newBookingTab = screen.getByRole('tab', { name: /Nowa rezerwacja/i })
    fireEvent.click(newBookingTab)

    await vi.waitFor(() => {
      expect(screen.getByText('Wybierz zabieg')).toBeInTheDocument()
    })
  })

  it('renders fallback phone notice', () => {
    render(<BookingPage />)

    expect(
      screen.getByText(/Wolisz umówić się telefonicznie lub przez Booksy/i),
    ).toBeInTheDocument()
    expect(screen.getByText('+48 726 154 460')).toBeInTheDocument()
  })
})
