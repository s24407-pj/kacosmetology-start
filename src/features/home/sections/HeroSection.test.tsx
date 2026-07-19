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

  it('exposes the practitioner identity and image alternative text', () => {
    render(<HeroSection />)

    expect(
      screen.getByRole('heading', { level: 1, name: brand.practitionerName }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: brand.practitionerName }),
    ).toBeVisible()
  })

  it('routes both CTAs and tracks their destinations', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)

    const booksyLink = screen.getByRole('link', { name: /umów wizytę/i })
    const approachLink = screen.getByRole('link', {
      name: /poznaj moje podejście/i,
    })

    expect(booksyLink).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(booksyLink).toHaveAttribute('target', '_blank')
    expect(approachLink).toHaveAttribute('href', '#o-mnie')

    await clickAnalyticsLink(user, booksyLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'hero',
    })

    await clickAnalyticsLink(user, approachLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Secondary CTA Click', {
      placement: 'hero',
      target: 'o-mnie',
    })
  })
})
