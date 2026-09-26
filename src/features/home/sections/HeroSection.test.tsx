import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  analytics: {
    trackInitiateCheckout: vi.fn(),
    trackLead: vi.fn(),
  },
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
import { analytics } from '@libs/analytics'
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
    render(<HeroSection />)

    expect(
      screen.getByRole('heading', { level: 1, name: brand.practitionerName }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: brand.practitionerName }),
    ).toBeVisible()
  })

  it('routes both CTAs and tracks Booksy checkout from the hero', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)

    const booksyLink = screen.getByRole('link', { name: /umów wizytę/i })
    const approachButton = screen.getByRole('button', {
      name: /poznaj moje podejście/i,
    })

    expect(booksyLink).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(booksyLink).toHaveAttribute('target', '_blank')

    await clickAnalyticsLink(user, booksyLink)
    expect(analytics.trackInitiateCheckout).toHaveBeenCalledWith({
      placement: 'hero',
      destinationUrl: primarySalonLocation.bookingUrl,
    })

    await user.click(approachButton)
    expect(scrollToId).toHaveBeenCalledWith('o-mnie')
  })
})
