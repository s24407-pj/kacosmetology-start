import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Text } from './Text'

describe('Text', () => {
  it('renders body text by default', () => {
    render(<Text>Body copy</Text>)

    const paragraph = screen.getByText('Body copy')
    expect(paragraph).toHaveClass('text-base', 'text-text-secondary')
    expect(paragraph).not.toHaveClass('italic')
  })

  it('applies variant, font and italic styles', () => {
    render(
      <Text variant="lead" font="playfair" italic className="extra">
        Lead copy
      </Text>,
    )

    const paragraph = screen.getByText('Lead copy')
    expect(paragraph).toHaveClass('text-xl', 'italic', 'extra', 'font-display')
  })
})
