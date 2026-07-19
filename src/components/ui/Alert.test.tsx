import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Alert } from './Alert'

describe('Alert', () => {
  afterEach(cleanup)

  it('renders an accessible alert by default', () => {
    render(<Alert>Informational copy</Alert>)

    expect(screen.getByRole('alert')).toHaveTextContent('Informational copy')
  })

  it.each([
    ['info', 'border-info-500'],
    ['warning', 'border-warning-500'],
    ['error', 'border-danger-500'],
    ['success', 'border-success-500'],
  ] as const)('applies the %s status variant', (variant, statusClass) => {
    render(<Alert variant={variant}>Status copy</Alert>)

    expect(screen.getByRole('alert')).toHaveClass(statusClass)
  })

  it('renders an optional semantic title', () => {
    render(<Alert title="Ważne">Treść komunikatu</Alert>)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Ważne' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Treść komunikatu')).toBeInTheDocument()
  })
})
