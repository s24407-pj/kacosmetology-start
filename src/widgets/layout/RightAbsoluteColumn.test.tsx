import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@context/UIContext', () => ({
  useUI: vi.fn(),
}))

vi.mock('@libs/openingHours', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@libs/openingHours')>()),
  isSalonOpenNow: () => true,
}))

import { useUI } from '@context/UIContext'
import { brand } from '@data/business'
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
    })
  })

  it('renders Instagram links with correct href', () => {
    render(<RightAbsoluteColumn />)

    const instagramLink = screen.getByRole('link', { name: 'Instagram' })
    expect(instagramLink).toHaveAttribute('href', brand.socialMedia.instagram)
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('stays visible above the bottom navigation on mobile', () => {
    const { container } = render(<RightAbsoluteColumn />)

    expect(container.querySelector('aside')).toHaveClass(
      'flex',
      'bottom-20',
      'min-[810px]:bottom-8',
    )
    expect(container.querySelector('aside')).not.toHaveClass('hidden')
  })

  it('renders Facebook links with correct href', () => {
    render(<RightAbsoluteColumn />)

    const facebookLink = screen.getByRole('link', { name: 'Facebook' })
    expect(facebookLink).toHaveAttribute('href', brand.socialMedia.facebook)
    expect(facebookLink).toHaveAttribute('target', '_blank')
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows scroll to top buttons when showScrollToTop is true', () => {
    useUIMock.mockReturnValue({
      activeSection: '',
      setActiveSection: vi.fn(),
      isMenuOpen: false,
      setIsMenuOpen: vi.fn(),
      scrolled: true,
      showScrollToTop: true,
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
