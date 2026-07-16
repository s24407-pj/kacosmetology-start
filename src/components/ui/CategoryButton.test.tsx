import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CategoryButton } from './CategoryButton'

describe('CategoryButton', () => {
  it('renders inactive state by default', () => {
    render(
      <CategoryButton
        icon={<span aria-hidden>☆</span>}
        label="Kosmetologia"
        onClick={() => {}}
      />,
    )

    const button = screen.getByRole('button', { name: 'Kosmetologia' })
    expect(button).toHaveClass(
      'bg-surface',
      'text-text-primary',
      'border-border-default',
    )
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).not.toHaveClass('bg-action')
  })

  it('renders active styles and forwards clicks', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <CategoryButton
        active
        icon={<span aria-hidden>★</span>}
        label="Promocje"
        onClick={handleClick}
      />,
    )

    const button = screen.getByRole('button', { name: 'Promocje' })
    expect(button).toHaveClass('bg-action', 'border-action', 'text-white')
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
