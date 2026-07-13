import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders an anchor with the primary variant and default size', () => {
    render(<Button href="#book">Book now</Button>)

    const link = screen.getByRole('link', { name: 'Book now' })
    expect(link).toHaveAttribute('href', '#book')
    expect(link).toHaveClass('bg-action', 'text-white')
    expect(link).toHaveClass('px-6', 'py-3')
  })

  it('applies the outline variant and large size', () => {
    render(
      <Button variant="outline" size="lg" href="#kontakt">
        Contact
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Contact' })
    expect(link).toHaveClass('border', 'border-action', 'hover:bg-action')
    expect(link).toHaveClass('px-8', 'py-4')
  })

  it('calls provided click handler', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button href="#cta" onClick={handleClick}>
        CTA
      </Button>,
    )

    await user.click(screen.getByRole('link', { name: 'CTA' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
