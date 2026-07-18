import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

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

import { trackPlausibleEvent } from '@libs/analytics'
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
      expect(image.getAttribute('srcset')).toContain('-360.webp 360w')
      expect(image.getAttribute('srcset')).toContain('-720.webp 720w')
      expect(image.getAttribute('srcset')).toContain('-1080.webp 1080w')
    }

    expect(screen.getAllByText('Poznaj ofertę')).toHaveLength(3)
    expect(container.querySelectorAll('svg')).toHaveLength(0)
    expect(container).not.toHaveTextContent(/\b(?:01|02|03|5|7|12)\b/)

    const cosmetologyImage = container.querySelector(
      'img[src="/images/specialization-cards/cosmetology-720.webp"]',
    )
    expect(cosmetologyImage).toHaveAttribute('width', '1600')
    expect(cosmetologyImage).toHaveAttribute('height', '1067')
    expect(cosmetologyImage).toHaveClass('object-[35%_center]')
  })

  it('preserves specialization click analytics', () => {
    render(<SpecializationsSection />)

    fireEvent.click(
      screen.getByRole('link', { name: 'Poznaj ofertę — Oprawa oka' }),
    )

    expect(trackPlausibleEvent).toHaveBeenCalledWith('Specialization Click', {
      area: 'cosmetology',
      placement: 'home',
      target: 'eye-styling',
    })
  })
})
