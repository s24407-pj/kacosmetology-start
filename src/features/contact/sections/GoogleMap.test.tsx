import '@testing-library/jest-dom/vitest'
import { brand, primarySalonLocation } from '@data/business'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import GoogleMap from './GoogleMap'

describe('GoogleMap', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a named, lazy, sandboxed map iframe', () => {
    render(<GoogleMap />)
    const iframe = screen.getByTitle(
      `Lokalizacja gabinetu ${brand.name} w ${primarySalonLocation.localityLocative}`,
    )

    expect(iframe).toHaveAttribute('src', primarySalonLocation.map.embedUrl)
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

  it('removes the loading skeleton after the iframe loads', () => {
    const { container } = render(<GoogleMap />)
    const iframe = container.querySelector('iframe')
    const mapCard = iframe?.parentElement
    const skeleton = mapCard?.querySelector(':scope > div')

    expect(skeleton).toBeInTheDocument()

    fireEvent.load(iframe!)

    expect(mapCard?.querySelector(':scope > div')).not.toBeInTheDocument()
  })
})
