import '@testing-library/jest-dom/vitest'
import type { PublicEmployee, PublicOffering } from '@libs/scheduler/types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EmployeeStep from './EmployeeStep'

describe('EmployeeStep', () => {
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

  const mockEmployees: PublicEmployee[] = [
    { id: 1, firstName: 'Katarzyna', lastName: 'Suwalska', role: 'OWNER' },
    { id: 2, firstName: 'Jan', lastName: 'Kowalski', role: 'EMPLOYEE' },
  ]

  it('renders employee choices and allows selection', () => {
    const handleSelect = vi.fn()
    render(
      <EmployeeStep
        employees={mockEmployees}
        selectedOffering={mockOffering}
        selectedEmployee={null}
        onSelectEmployee={handleSelect}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByText('Katarzyna Suwalska')).toBeInTheDocument()
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument()
    expect(screen.getByText('Dowolny specjalista')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Katarzyna Suwalska'))
    expect(handleSelect).toHaveBeenCalledWith(mockEmployees[0])
  })

  it('calls onBack when back button is clicked', () => {
    const handleBack = vi.fn()
    render(
      <EmployeeStep
        employees={mockEmployees}
        selectedOffering={mockOffering}
        selectedEmployee={null}
        onSelectEmployee={vi.fn()}
        onBack={handleBack}
      />,
    )

    fireEvent.click(screen.getByText('Zmień zabieg'))
    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})
