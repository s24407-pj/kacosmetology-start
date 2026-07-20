import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@libs/utils', async () => {
  const actual =
    await vi.importActual<typeof import('@libs/utils')>('@libs/utils')
  return {
    ...actual,
    scrollToId: vi.fn(() => true),
  }
})

import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { scrollToId } from '@libs/utils'
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
    const { container } = render(<HeroSection />)

    const heading = screen.getByRole('heading', {
      level: 1,
      name: brand.practitionerName,
    })
    const image = screen.getByRole('img', { name: brand.practitionerName })
    const hero = container.querySelector('#hero')

    expect(heading).toBeInTheDocument()
    expect(image).toBeVisible()
    expect(hero?.querySelectorAll('[data-reveal-on-scroll]')).toHaveLength(0)
    expect(
      hero?.querySelector('.hero-cta-heart .draw-heart-path'),
    ).not.toBeNull()
  })

  it('routes both CTAs and tracks their destinations', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)

    const booksyLink = screen.getByRole('link', { name: /umów wizytę/i })
    const approachButton = screen.getByRole('button', {
      name: /poznaj moje podejście/i,
    })

    expect(booksyLink).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(booksyLink).toHaveAttribute('target', '_blank')

    await clickAnalyticsLink(user, booksyLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'hero',
    })

    await user.click(approachButton)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Secondary CTA Click', {
      placement: 'hero',
      target: 'o-mnie',
    })
    expect(scrollToId).toHaveBeenCalledWith('o-mnie')
  })
})
