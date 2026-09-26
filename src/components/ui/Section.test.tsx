import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Section } from './Section'

describe('Section', () => {
  afterEach(cleanup)

  it('renders its content inside a section addressable by id', () => {
    render(
      <Section id="about">
        <p>Content</p>
      </Section>,
    )

    expect(screen.getByText('Content').closest('section')).toHaveAttribute(
      'id',
      'about',
    )
  })
})
