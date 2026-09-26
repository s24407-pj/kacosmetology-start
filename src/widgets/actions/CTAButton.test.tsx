import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@context/UIContext', () => ({
  useUI: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  analytics: {
    trackInitiateCheckout: vi.fn(),
    trackLead: vi.fn(),
  },
}))

import type { UIContextType } from '@app-types/types'
import { useUI } from '@context/UIContext'
import { primarySalonLocation } from '@data/business'
import { analytics } from '@libs/analytics'
import { clickAnalyticsLink } from '@/test/clickAnalyticsLink'
import CTAButton from './CTAButton'

const useUIMock = vi.mocked(useUI)

const createContextValue = (overrides: Partial<UIContextType> = {}) => ({
  activeSection: 'hero',
  setActiveSection: vi.fn(),
  isMenuOpen: false,
  setIsMenuOpen: vi.fn(),
  scrolled: false,
  showScrollToTop: false,
  ...overrides,
})

describe('CTAButton', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('expands the label when the page is not scrolled', () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: false }))

    render(<CTAButton />)

    const label = screen.getByText('Umów się')
    expect(label.parentElement).not.toHaveAttribute('aria-hidden', 'true')
  })

  it('collapses the label when the page is scrolled', () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: true }))

    render(<CTAButton />)

    const label = screen.getByText('Umów się')
    expect(label.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('tracks clicks with the provided placement', async () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: false }))
    const user = userEvent.setup()

    render(<CTAButton placement="footer" />)

    const link = screen.getByRole('link', { name: /Umów wizytę w Booksy/ })
    expect(link).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await clickAnalyticsLink(user, link)

    expect(analytics.trackInitiateCheckout).toHaveBeenCalledWith({
      placement: 'footer',
      destinationUrl: primarySalonLocation.bookingUrl,
    })
  })
})
