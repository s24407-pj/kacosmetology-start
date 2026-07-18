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
    expect(label.parentElement).toHaveClass('grid-cols-[1fr]')
    expect(label.parentElement).toHaveClass('ml-2')
    expect(label.parentElement).toHaveClass('opacity-100')
    expect(label).toHaveClass('overflow-hidden')
  })

  it('collapses the label when the page is scrolled', () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: true }))

    render(<CTAButton />)

    const label = screen.getByText('Umów się')
    expect(label.parentElement).toHaveClass('grid-cols-[0fr]')
    expect(label.parentElement).toHaveClass('ml-0')
    expect(label.parentElement).toHaveClass('opacity-0')
    expect(label.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('tracks clicks with the provided placement', async () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: false }))
    const user = userEvent.setup()

    render(<CTAButton placement="footer" />)

    const link = screen.getByRole('link', { name: /Umów wizytę w Booksy/ })
    expect(link).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(link).toHaveAttribute('target', '_blank')
    await user.click(link)

    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'footer',
    })
  })
})
