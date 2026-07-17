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

import type { UIContextType } from '@app-types/types'
import { useUI } from '@context/UIContext'
import { primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import CTAButton from './CTAButton'

const useUIMock = vi.mocked(useUI)

const createContextValue = (overrides: Partial<UIContextType> = {}) => ({
  activeSection: 'hero',
  setActiveSection: vi.fn(),
  isMenuOpen: false,
  setIsMenuOpen: vi.fn(),
  scrolled: false,
  showScrollToTop: false,
  showStickyBookCTA: false,
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
    expect(label).toHaveClass('opacity-100')
    expect(label).toHaveClass('w-[8ch]')
  })

  it('collapses the label when the page is scrolled', () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: true }))

    render(<CTAButton />)

    const label = screen.getByText('Umów się')
    expect(label).toHaveClass('opacity-0')
    expect(label).toHaveClass('w-0')
  })

  it('tracks clicks with the provided placement', async () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: false }))
    const user = userEvent.setup()

    render(<CTAButton placement="footer" />)

    const link = screen.getByRole('link', { name: /Umów się/ })
    expect(link).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    await user.click(link)

    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'footer',
    })
  })
})
