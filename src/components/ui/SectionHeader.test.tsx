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

  it('supports accent tone and left alignment', () => {
    render(<SectionHeader title="Services" tone="accent" align="left" />)

    const heading = screen.getByRole('heading', { name: 'Services' })
    expect(heading).toHaveClass('text-action')
    expect(heading.parentElement).not.toHaveClass('mx-auto', 'text-center')
  })

  it('does not render a decorative divider by default', () => {
    const { container } = render(<SectionHeader title="Services" />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})
