import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('renders title and optional subtitle', () => {
    render(<SectionHeader title="About" subtitle="Learn more" />)

    const heading = screen.getByRole('heading', { name: 'About' })
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-text-primary')
    expect(screen.getByText('Learn more')).toBeInTheDocument()
  })

  it('applies gradient styling when enabled', () => {
    render(<SectionHeader title="Services" gradient />)

    const heading = screen.getByRole('heading', { name: 'Services' })
    expect(heading).toHaveClass('text-action')
  })
})
