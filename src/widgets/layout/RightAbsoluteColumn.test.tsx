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

vi.mock('@libs/openingHours', () => ({
  isSalonOpenNow: () => true,
}))

import { useUI } from '@context/UIContext'
import { trackPlausibleEvent } from '@libs/analytics'
import RightAbsoluteColumn from './RightAbsoluteColumn'

const useUIMock = vi.mocked(useUI)

describe('RightAbsoluteColumn', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useUIMock.mockReturnValue({
      activeSection: '',
      setActiveSection: vi.fn(),
      isMenuOpen: false,
      setIsMenuOpen: vi.fn(),
      scrolled: false,
      showScrollToTop: false,
      showStickyBookCTA: false,
    })
  })

  it('renders Instagram links with correct href and tracking', async () => {
    const user = userEvent.setup()
    render(<RightAbsoluteColumn />)

    const instagramLink = screen.getByRole('link', { name: 'Instagram' })
    expect(instagramLink).toHaveAttribute(
      'href',
      'https://www.instagram.com/ka.cosmetology',
    )
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(instagramLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Social Media Click', {
      platform: 'instagram',
      placement: 'right_column',
    })
  })

  it('renders Facebook links with correct href and tracking', async () => {
    const user = userEvent.setup()
    render(<RightAbsoluteColumn />)

    const facebookLink = screen.getByRole('link', { name: 'Facebook' })
    expect(facebookLink).toHaveAttribute(
      'href',
      'https://www.facebook.com/profile.php?id=61579179969990',
    )
    expect(facebookLink).toHaveAttribute('target', '_blank')
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(facebookLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Social Media Click', {
      platform: 'facebook',
      placement: 'right_column',
    })
  })

  it('shows scroll to top buttons when showScrollToTop is true', () => {
    useUIMock.mockReturnValue({
      activeSection: '',
      setActiveSection: vi.fn(),
      isMenuOpen: false,
      setIsMenuOpen: vi.fn(),
      scrolled: true,
      showScrollToTop: true,
      showStickyBookCTA: false,
    })

    render(<RightAbsoluteColumn />)

    const scrollButtons = screen.getAllByRole('button', {
      name: 'Przewiń na górę',
    })
    scrollButtons.forEach((btn) => {
      const wrapper = btn.parentElement
      expect(wrapper).not.toHaveAttribute('inert')
      expect(wrapper).toHaveClass('opacity-100')
    })
  })

  it('hides scroll to top buttons when showScrollToTop is false', () => {
    render(<RightAbsoluteColumn />)

    const scrollButtons = screen.getAllByRole('button', {
      name: 'Przewiń na górę',
      hidden: true,
    })
    scrollButtons.forEach((btn) => {
      const wrapper = btn.parentElement
      expect(wrapper).toHaveAttribute('inert')
      expect(wrapper).toHaveClass('opacity-0')
      expect(wrapper).toHaveClass('pointer-events-none')
    })
  })
})
