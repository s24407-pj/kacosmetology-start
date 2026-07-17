import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@hooks/useSectionNavigation', () => ({
  useSectionNavigation: () => vi.fn(),
}))

import { trackPlausibleEvent } from '@libs/analytics'
import HeroSection from './HeroSection'

describe('HeroSection', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the hero section with correct id', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('#hero')
    expect(section).toBeInTheDocument()
  })

  it('displays location badge with Starogard Gdański', () => {
    render(<HeroSection />)
    expect(screen.getByText('Starogard Gdański')).toBeInTheDocument()
  })

  it('displays main heading with name', () => {
    render(<HeroSection />)
    expect(screen.getByText('Katarzyna Suwalska')).toBeInTheDocument()
  })

  it('uses the practitioner name as the hero image alternative', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('img', { name: 'Katarzyna Suwalska' }),
    ).toBeVisible()
  })

  it('displays tagline', () => {
    render(<HeroSection />)
    expect(
      screen.getByText(/Holistyczna kosmetologia i trychologia dopasowana/),
    ).toBeInTheDocument()
  })

  it('renders Booksy CTA button with tracking', async () => {
    const user = userEvent.setup()
    const { container } = render(<HeroSection />)

    const booksyLink = container.querySelector(
      'a[href="https://kacosmetology.booksy.com"]',
    )
    expect(booksyLink).toBeInTheDocument()
    expect(booksyLink).toHaveAttribute('target', '_blank')
    expect(booksyLink).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(booksyLink!)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'hero',
    })
  })

  it('displays location icon in hero section', () => {
    const { container } = render(<HeroSection />)
    const mapPinIcons = container.querySelectorAll('svg')
    expect(mapPinIcons.length).toBeGreaterThan(0)
  })

  it('renders scroll button', () => {
    render(<HeroSection />)
    const scrollButton = screen.getByRole('button')
    expect(scrollButton).toBeInTheDocument()
  })
})
