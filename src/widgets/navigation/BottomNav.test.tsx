import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@context/UIContext', () => ({
  useUI: vi.fn(),
}))

const navigateToSection = vi.fn()
vi.mock('@hooks/useSectionNavigation', () => ({
  useSectionNavigation: () => navigateToSection,
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import type { UIContextType } from '@app-types/types'
import { useUI } from '@context/UIContext'
import { BOTTOM_NAV_ITEMS } from '@data/navigation'
import { trackPlausibleEvent } from '@libs/analytics'
import BottomNav from './BottomNav'

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

describe('BottomNav', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all nav items', () => {
    useUIMock.mockReturnValue(createContextValue())

    render(<BottomNav />)

    BOTTOM_NAV_ITEMS.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })
  })

  it('tracks analytics and scrolls to section on click', async () => {
    useUIMock.mockReturnValue(createContextValue())
    const user = userEvent.setup()

    render(<BottomNav />)

    await user.click(screen.getByRole('button', { name: 'Zabiegi' }))

    expect(trackPlausibleEvent).toHaveBeenCalledWith('Navigation Link Click', {
      target: 'zabiegi',
      context: 'bottom-nav',
    })
    expect(navigateToSection).toHaveBeenCalledWith('zabiegi')
  })

  it('marks the active section button with aria-current', () => {
    useUIMock.mockReturnValue(createContextValue({ activeSection: 'kontakt' }))

    render(<BottomNav />)

    expect(screen.getByRole('button', { name: 'Kontakt' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: 'Zabiegi' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marks effects button as active when effects section is active', () => {
    useUIMock.mockReturnValue(createContextValue({ activeSection: 'efekty' }))

    render(<BottomNav />)

    expect(screen.getByRole('button', { name: 'Efekty' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
