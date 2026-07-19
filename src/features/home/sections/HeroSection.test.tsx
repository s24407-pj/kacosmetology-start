import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { clickAnalyticsLink } from '@/test/clickAnalyticsLink'
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
    expect(
      screen.getByText(primarySalonLocation.address.locality),
    ).toBeInTheDocument()
  })

  it('displays main heading with name', () => {
    render(<HeroSection />)
    expect(screen.getByText(brand.practitionerName)).toBeInTheDocument()
  })

  it('uses the practitioner name as the hero image alternative', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('img', { name: brand.practitionerName }),
    ).toBeVisible()
  })

  it('displays tagline', () => {
    render(<HeroSection />)
    expect(
      screen.getByText(
        'Holistyczna kosmetologia i trychologia dopasowana do Ciebie.',
      ),
    ).toBeInTheDocument()
  })

  it('displays the online booking badge without the professional title', () => {
    render(<HeroSection />)

    expect(screen.getByText('Umów się online 24/7')).toBeInTheDocument()
    expect(screen.queryByText('magister kosmetologii')).not.toBeInTheDocument()
  })

  it('renders external Booksy CTA with tracking', async () => {
    const user = userEvent.setup()
    const { container } = render(<HeroSection />)

    const booksyLink = container.querySelector(
      `a[href="${primarySalonLocation.bookingUrl}"]`,
    )
    expect(booksyLink).toBeInTheDocument()
    await clickAnalyticsLink(user, booksyLink!)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'hero',
    })
    expect(booksyLink).toHaveAttribute('target', '_blank')
  })

  it('displays location icon in hero section', () => {
    const { container } = render(<HeroSection />)
    const mapPinIcons = container.querySelectorAll('svg')
    expect(mapPinIcons.length).toBeGreaterThan(0)
  })

  it('renders scroll button', () => {
    render(<HeroSection />)
    const scrollButton = screen.getByRole('link', { name: 'Przewiń w dół' })
    expect(scrollButton).toBeInTheDocument()
  })
})
