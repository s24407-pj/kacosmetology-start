import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Text } from './Text'

describe('Text', () => {
  it('renders body copy as a paragraph', () => {
    render(<Text>Body copy</Text>)

    expect(screen.getByText('Body copy').tagName).toBe('P')
  })

  it('supports lead, display-font, and italic variants', () => {
    render(
      <Text variant="lead" font="playfair" italic className="extra">
        Lead copy
      </Text>,
    )

    expect(screen.getByText('Lead copy')).toHaveClass(
      'italic',
      'extra',
      'font-display',
    )
  })
})
