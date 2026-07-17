import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@context/UIContext', () => ({
  useUI: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { useUI } from '@context/UIContext'
import { primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import StickyBookingCTA from './StickyBookingCTA'

const useUIMock = vi.mocked(useUI)

const baseContext = {
  activeSection: 'services',
  setActiveSection: vi.fn(),
  isMenuOpen: false,
  setIsMenuOpen: vi.fn(),
  scrolled: true,
  showScrollToTop: false,
  showStickyBookCTA: true,
}

describe('StickyBookingCTA', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useUIMock.mockReturnValue(baseContext)
  })

  it('renders a link to Booksy with correct attributes', () => {
    render(<StickyBookingCTA />)

    const link = screen.getByRole('link', { name: /Umów się/ })
    expect(link).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('is visible when showStickyBookCTA is true', () => {
    render(<StickyBookingCTA />)

    const link = screen.getByRole('link', { name: /Umów się/ })
    const wrapper = link.closest('div[aria-hidden]')
    expect(wrapper).toHaveAttribute('aria-hidden', 'false')
    expect(wrapper).toHaveClass('opacity-100')
    expect(wrapper).toHaveClass('pointer-events-auto')
  })

  it('is hidden when showStickyBookCTA is false', () => {
    useUIMock.mockReturnValue({ ...baseContext, showStickyBookCTA: false })
    render(<StickyBookingCTA />)

    const link = screen.getByRole('link', { name: /Umów się/, hidden: true })
    const wrapper = link.closest('div[aria-hidden]')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper).toHaveClass('opacity-0')
    expect(wrapper).toHaveClass('pointer-events-none')
  })

  it('tracks a Booksy click event with sticky-cta placement', async () => {
    const user = userEvent.setup()
    render(<StickyBookingCTA />)

    await user.click(screen.getByRole('link', { name: /Umów się/ }))

    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'sticky-cta',
    })
  })
})
