import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Section } from './Section'

describe('Section', () => {
  it('renders with white background by default', () => {
    render(
      <Section id="about">
        <p>Content</p>
      </Section>,
    )

    const section = screen.getByText('Content').closest('section')
    expect(section).toHaveAttribute('id', 'about')
    expect(section).toHaveClass('bg-surface', 'py-16')
  })

  it('applies gradient background and custom class', () => {
    render(
      <Section background="gradient" className="extra-padding">
        <p>Gradient content</p>
      </Section>,
    )

    const section = screen.getByText('Gradient content').closest('section')
    expect(section).toHaveClass(
      'bg-[linear-gradient(180deg,var(--color-surface-muted)_0%,var(--color-surface)_100%)]',
      'extra-padding',
    )
  })

  it('applies gray background', () => {
    render(
      <Section background="gray">
        <p>Gray content</p>
      </Section>,
    )

    const section = screen.getByText('Gray content').closest('section')
    expect(section).toHaveClass('bg-surface-muted')
  })

  it('applies contact background', () => {
    render(
      <Section background="contact">
        <p>Contact content</p>
      </Section>,
    )

    const section = screen.getByText('Contact content').closest('section')
    expect(section).toHaveClass(
      'bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-surface-muted)_68%,var(--color-surface-muted)_100%)]',
    )
  })

  it('renders simple separators when decorated', () => {
    const { container } = render(
      <Section decorated>
        <p>Decorated content</p>
      </Section>,
    )

    const separators = container.querySelectorAll(
      '[aria-hidden="true"] .bg-border-default',
    )
    expect(separators).toHaveLength(2)
  })

  it('renders only the top separator when requested', () => {
    const { container } = render(
      <Section decorated="top">
        <p>Top decorated content</p>
      </Section>,
    )

    const separator = container.querySelector(
      '[aria-hidden="true"] .bg-border-default',
    )
    expect(separator).toHaveClass('top-0')
    expect(separator).not.toHaveClass('bottom-0')
  })

  it('applies custom container class', () => {
    render(
      <Section containerClassName="xl:max-w-[85rem]">
        <p>Wide content</p>
      </Section>,
    )

    const container = screen.getByText('Wide content').parentElement
    expect(container).toHaveClass('xl:max-w-[85rem]')
  })

  it('supports a compact accent section', () => {
    render(
      <Section background="accent" spacing="compact">
        <p>Accent content</p>
      </Section>,
    )

    const section = screen.getByText('Accent content').closest('section')
    expect(section).toHaveClass('bg-action', 'py-14', 'sm:py-16')
  })
})
