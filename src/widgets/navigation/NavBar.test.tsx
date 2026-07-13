import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@context/UIContext', () => ({
  useUI: vi.fn(),
}))

vi.mock('@libs/utils', async () => {
  const actual =
    await vi.importActual<typeof import('@libs/utils')>('@libs/utils')
  return {
    ...actual,
    scrollToTop: vi.fn(),
  }
})

const navigateToSection = vi.fn()
vi.mock('@hooks/useSectionNavigation', () => ({
  useSectionNavigation: () => navigateToSection,
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@widgets/actions/PromotionBanner', () => ({
  default: () => <div data-testid="promotion-banner" />,
}))

vi.mock('@widgets/actions/CTAButton', () => ({
  default: ({ placement }: { placement: string }) => (
    <div data-testid={`cta-${placement}`} />
  ),
}))

import type { UIContextType } from '@app-types/types'
import { useUI } from '@context/UIContext'
import { MAIN_NAV_ITEMS } from '@data/navigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { scrollToTop } from '@libs/utils'
import NavBar from './NavBar'

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

describe('NavBar', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('scrolls to top when the logo is clicked', async () => {
    useUIMock.mockReturnValue(createContextValue({ scrolled: true }))
    const user = userEvent.setup()

    render(<NavBar />)

    await user.click(
      screen.getByRole('button', { name: 'Wróć na początek strony' }),
    )

    expect(trackPlausibleEvent).toHaveBeenCalledWith('Logo Click')
    expect(scrollToTop).toHaveBeenCalled()
  })

  it('tracks desktop navigation clicks and scrolls to the section', async () => {
    useUIMock.mockReturnValue(createContextValue())
    const user = userEvent.setup()

    render(<NavBar />)

    await user.click(screen.getAllByRole('link', { name: 'O mnie' })[0])

    expect(trackPlausibleEvent).toHaveBeenCalledWith('Navigation Link Click', {
      target: 'o-mnie',
      context: 'desktop',
    })
    expect(navigateToSection).toHaveBeenCalledWith('o-mnie')
  })

  it('shows the hamburger button with correct aria attributes when menu is closed', () => {
    useUIMock.mockReturnValue(createContextValue({ isMenuOpen: false }))
    render(<NavBar />)
    const btn = screen.getByRole('button', { name: 'Otwórz menu' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the close button with correct aria attributes when menu is open', () => {
    useUIMock.mockReturnValue(createContextValue({ isMenuOpen: true }))
    render(<NavBar />)
    const btn = screen.getByRole('button', { name: 'Zamknij menu' })
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls setIsMenuOpen(true) when hamburger is clicked and menu is closed', async () => {
    const setIsMenuOpen = vi.fn()
    useUIMock.mockReturnValue(
      createContextValue({ isMenuOpen: false, setIsMenuOpen }),
    )
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByRole('button', { name: 'Otwórz menu' }))
    expect(setIsMenuOpen).toHaveBeenCalledWith(true)
  })

  it('calls setIsMenuOpen(false) when hamburger is clicked and menu is open', async () => {
    const setIsMenuOpen = vi.fn()
    useUIMock.mockReturnValue(
      createContextValue({ isMenuOpen: true, setIsMenuOpen }),
    )
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByRole('button', { name: 'Zamknij menu' }))
    expect(setIsMenuOpen).toHaveBeenCalledWith(false)
  })

  it('does not render the mobile menu when isMenuOpen is false', () => {
    useUIMock.mockReturnValue(createContextValue({ isMenuOpen: false }))
    render(<NavBar />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders all navigation items in the mobile menu when open', () => {
    useUIMock.mockReturnValue(createContextValue({ isMenuOpen: true }))
    render(<NavBar />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    MAIN_NAV_ITEMS.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })
  })

  it('tracks mobile-menu analytics, closes menu, and scrolls to section when a menu item is clicked', async () => {
    const setIsMenuOpen = vi.fn()
    useUIMock.mockReturnValue(
      createContextValue({ isMenuOpen: true, setIsMenuOpen }),
    )
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })
    const user = userEvent.setup()
    render(<NavBar />)
    await user.click(screen.getByRole('button', { name: 'Zabiegi' }))
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Navigation Link Click', {
      target: 'zabiegi',
      context: 'mobile-menu',
    })
    expect(setIsMenuOpen).toHaveBeenCalledWith(false)
    await waitFor(() => {
      expect(navigateToSection).toHaveBeenCalledWith('zabiegi')
    })
  })

  it('locks body scroll when the menu is open', () => {
    useUIMock.mockReturnValue(createContextValue({ isMenuOpen: true }))
    render(<NavBar />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('unlocks body scroll when the menu is closed', () => {
    useUIMock.mockReturnValue(createContextValue({ isMenuOpen: false }))
    render(<NavBar />)
    expect(document.body.style.overflow).toBe('')
  })
})
