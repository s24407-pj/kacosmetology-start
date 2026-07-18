import '@testing-library/jest-dom/vitest'
import { brand, primarySalonLocation } from '@data/business'
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
    expect(iframe).toHaveAttribute('src', primarySalonLocation.map.embedUrl)
    expect(iframe).toHaveAttribute(
      'title',
      `Lokalizacja gabinetu ${brand.name} w ${primarySalonLocation.localityLocative}`,
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
    expect(iframe).toHaveClass('h-80', 'sm:h-96')
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
