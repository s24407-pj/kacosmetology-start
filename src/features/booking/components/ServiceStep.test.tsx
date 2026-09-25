import '@testing-library/jest-dom/vitest'
import type { PublicOffering } from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ServiceStep from './ServiceStep'

describe('ServiceStep', () => {
  afterEach(() => {
    cleanup()
  })

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
      name: 'Henna brwi z regulacją',
      durationMinutes: 40,
      price: 60,
      active: true,
      categoryId: 1,
    },
    {
      id: 3,
      companyId: 1,
      name: 'Konsultacja trychologiczna',
      durationMinutes: 60,
      price: 150,
      active: true,
      categoryId: 2,
    },
  ]

  it('renders all active offerings', () => {
    render(
      <ServiceStep
        offerings={mockOfferings}
        selectedOffering={null}
        onSelectOffering={vi.fn()}
      />,
    )

    expect(screen.getByText('Oczyszczanie wodorowe')).toBeInTheDocument()
    expect(screen.getByText('Henna brwi z regulacją')).toBeInTheDocument()
    expect(screen.getByText('Konsultacja trychologiczna')).toBeInTheDocument()
  })

  it('filters offerings by category tab', () => {
    render(
      <ServiceStep
        offerings={mockOfferings}
        selectedOffering={null}
        onSelectOffering={vi.fn()}
      />,
    )

    const oprawaOkaTab = screen.getByRole('tab', { name: 'Oprawa oka' })
    fireEvent.click(oprawaOkaTab)

    expect(screen.getByText('Henna brwi z regulacją')).toBeInTheDocument()
    expect(screen.queryByText('Oczyszczanie wodorowe')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Konsultacja trychologiczna'),
    ).not.toBeInTheDocument()
  })

  it('filters offerings by search input', () => {
    render(
      <ServiceStep
        offerings={mockOfferings}
        selectedOffering={null}
        onSelectOffering={vi.fn()}
      />,
    )

    const searchInput = screen.getByLabelText('Wyszukaj zabieg')
    fireEvent.change(searchInput, { target: { value: 'wodorowe' } })

    expect(screen.getByText('Oczyszczanie wodorowe')).toBeInTheDocument()
    expect(screen.queryByText('Henna brwi z regulacją')).not.toBeInTheDocument()
  })

  it('calls onSelectOffering when offering card is clicked', () => {
    const handleSelect = vi.fn()
    render(
      <ServiceStep
        offerings={mockOfferings}
        selectedOffering={null}
        onSelectOffering={handleSelect}
      />,
    )

    const serviceBtn = screen
      .getByText('Oczyszczanie wodorowe')
      .closest('button')
    expect(serviceBtn).not.toBeNull()
    fireEvent.click(serviceBtn!)

    expect(handleSelect).toHaveBeenCalledWith(mockOfferings[0])
  })
})
