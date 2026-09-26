import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

import SpecializationsSection from './SpecializationsSection'

describe('SpecializationsSection', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders three photographic links to the specialization routes', () => {
    const { container } = render(<SpecializationsSection />)
    const expectedLinks = [
      ['Kosmetologia', '/kosmetologia'],
      ['Oprawa oka', '/oprawa-oka'],
      ['Trychologia', '/trychologia'],
    ] as const

    for (const [name, href] of expectedLinks) {
      expect(
        screen.getByRole('link', { name: `Poznaj ofertę — ${name}` }),
      ).toHaveAttribute('href', href)
    }

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(3)
    for (const image of images) {
      expect(image).toHaveAttribute('alt', '')
      expect(image).toHaveAttribute('loading', 'lazy')
      expect(image).toHaveAttribute('width')
      expect(image).toHaveAttribute('height')
    }

    expect(container).not.toHaveTextContent(/\b(?:01|02|03|5|7|12)\b/)
  })
})
