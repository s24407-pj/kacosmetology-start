import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Heading } from './Heading'

describe('Heading', () => {
  it('renders the default section heading level', () => {
    render(<Heading>Section title</Heading>)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Section title',
    )
  })

  it('keeps the semantic level independent from visual variant and tone', () => {
    render(
      <Heading level={3} variant="card" tone="accent" className="extra-class">
        Card title
      </Heading>,
    )

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Card title',
    )
  })
})
