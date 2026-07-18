import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert } from './Alert'

describe('Alert', () => {
  it('renders info variant by default', () => {
    render(<Alert>Informational copy</Alert>)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-blue-50', 'border-info-500', 'text-blue-900')
    expect(alert.querySelector('svg')).toBeInTheDocument()
  })

  it('renders other variants', () => {
    render(<Alert variant="error">Error copy</Alert>)

    const alerts = screen.getAllByRole('alert')
    const alert = alerts.pop()
    expect(alert).toHaveClass('bg-red-50', 'border-danger-500', 'text-red-900')
  })

  it('renders an optional semantic title', () => {
    render(<Alert title="Ważne">Treść komunikatu</Alert>)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Ważne' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Treść komunikatu')).toBeInTheDocument()
  })
})
