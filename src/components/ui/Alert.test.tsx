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

  it('renders an optional semantic title', () => {
    render(<Alert title="Ważne">Treść komunikatu</Alert>)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Ważne' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Treść komunikatu')).toBeInTheDocument()
  })
})
