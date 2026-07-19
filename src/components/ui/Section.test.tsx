import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Section } from './Section'

describe('Section', () => {
  afterEach(cleanup)

  it('composes content and passes through section and container classes', () => {
    render(
      <Section
        id="about"
        className="custom-section"
        containerClassName="custom-container"
      >
        <p>Content</p>
      </Section>,
    )

    const section = screen.getByText('Content').closest('section')
    expect(section).toHaveAttribute('id', 'about')
    expect(section).toHaveClass('custom-section')
    expect(screen.getByText('Content').parentElement).toHaveClass(
      'custom-container',
    )
  })

  it.each([
    ['white', 'regular', 'bg-surface', 'py-16'],
    [
      'gradient',
      'regular',
      'bg-[linear-gradient(180deg,var(--color-surface-muted)_0%,var(--color-surface)_100%)]',
      'py-16',
    ],
    ['gray', 'regular', 'bg-surface-muted', 'py-16'],
    [
      'contact',
      'regular',
      'bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-surface-muted)_68%,var(--color-surface-muted)_100%)]',
      'py-16',
    ],
    ['mesh', 'regular', 'bg-surface-muted', 'py-16'],
    ['accent', 'compact', 'bg-action', 'py-14'],
  ] as const)(
    'supports the %s background with %s spacing',
    (background, spacing, backgroundClass, spacingClass) => {
      const { container } = render(
        <Section background={background} spacing={spacing}>
          <p>Variant content</p>
        </Section>,
      )

      expect(container.querySelector('section')).toHaveClass(
        backgroundClass,
        spacingClass,
      )
    },
  )

  it('renders the requested decoration structure', () => {
    const { container } = render(
      <Section decorated="top">
        <p>Decorated content</p>
      </Section>,
    )

    const separators = container.querySelectorAll(
      '[aria-hidden="true"] .bg-border-default',
    )
    expect(separators).toHaveLength(1)
    expect(separators[0]).toHaveClass('top-0')
  })
})
