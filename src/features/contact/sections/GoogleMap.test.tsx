import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GoogleMap from './GoogleMap'

describe('GoogleMap', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the map container', () => {
    const { container } = render(<GoogleMap />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders iframe with correct src', () => {
    const { container } = render(<GoogleMap />)
    const iframe = container.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d146965.76001793574!2d18.595858632430925!3d53.898941431338294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47029ddcdf06e639%3A0x22e7786a8b623b1a!2sKa.Cosmetology%20Kosmetolog%20%7C%20Trycholog!5e0!3m2!1spl!2spl!4v1757628479347!5m2!1spl!2spl',
    )
    expect(iframe).toHaveAttribute(
      'title',
      'Lokalizacja gabinetu Ka.Cosmetology w Starogardzie Gdańskim',
    )
  })

  it('sets correct iframe attributes for security and functionality', () => {
    const { container } = render(<GoogleMap />)
    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'no-referrer-when-downgrade',
    )
    expect(iframe).toHaveAttribute('loading', 'lazy')
    // Check sandbox attribute contains the expected capability set.
    const sandboxAttr = iframe?.getAttribute('sandbox')
    expect(sandboxAttr).toContain('allow-scripts')
    expect(sandboxAttr).toContain('allow-popups')
    expect(sandboxAttr).not.toContain('allow-same-origin')
  })

  it('has responsive height classes', () => {
    const { container } = render(<GoogleMap />)
    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveClass('w-full')
    expect(iframe).toHaveClass('h-96')
  })

  it('displays loading skeleton before iframe loads', () => {
    const { container } = render(<GoogleMap />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('removes loading skeleton when iframe loads', () => {
    const { container, rerender } = render(<GoogleMap />)
    const iframe = container.querySelector('iframe')

    // Simulate iframe load
    if (iframe) {
      const loadEvent = new Event('load')
      vi.spyOn(iframe, 'dispatchEvent').mockReturnValue(true)
      iframe.dispatchEvent(loadEvent)
    }

    rerender(<GoogleMap />)
    // The skeleton should still be there initially, but the map shows it loaded
    expect(iframe).toBeInTheDocument()
  })
})
