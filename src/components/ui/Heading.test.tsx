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

  it('separates semantic level from visual variant and tone', () => {
    render(
      <Heading level={3} variant="card" tone="accent" className="extra-class">
        Card title
      </Heading>,
    )

    const heading = screen.getByRole('heading', { name: 'Card title' })
    expect(heading.tagName).toBe('H3')
    expect(heading).toHaveClass('text-xl', 'text-action', 'extra-class')
  })

  it('supports the dedicated home hero scale', () => {
    render(
      <Heading level={1} variant="hero">
        Hero title
      </Heading>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(
      'text-5xl',
      'md:text-7xl',
      'leading-tight',
    )
  })
})
