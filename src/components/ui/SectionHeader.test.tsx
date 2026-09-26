import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('renders title and optional subtitle', () => {
    render(<SectionHeader title="About" subtitle="Learn more" />)

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('Learn more')).toBeInTheDocument()
  })

  it('does not render a decorative divider by default', () => {
    const { container } = render(<SectionHeader title="Services" />)

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})
