import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Heading } from './Heading'

describe('Heading', () => {
  it('renders default h2 with base styles', () => {
    render(<Heading>Section title</Heading>)

    const heading = screen.getByRole('heading', { name: 'Section title' })
    expect(heading.tagName).toBe('H2')
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-text-primary')
  })

  it('supports custom level and gradient styling', () => {
    render(
      <Heading level={3} gradient className="extra-class">
        Gradient title
      </Heading>,
    )

    const heading = screen.getByRole('heading', { name: 'Gradient title' })
    expect(heading.tagName).toBe('H3')
    expect(heading).toHaveClass('text-2xl', 'text-action', 'extra-class')
  })
})
