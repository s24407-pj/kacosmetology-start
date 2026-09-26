import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders a link to its target', () => {
    render(<Button href="#book">Book now</Button>)

    expect(screen.getByRole('link', { name: 'Book now' })).toHaveAttribute(
      'href',
      '#book',
    )
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
