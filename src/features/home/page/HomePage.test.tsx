import '@testing-library/jest-dom/vitest'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@hooks/useScrollDepthTracking', () => ({
  useScrollDepthTracking: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => window.location.hash.slice(1),
}))

vi.mock('@features/contact/sections/GoogleMap', () => ({
  default: () => <div>GoogleMap</div>,
}))

vi.mock('@features/services/sections/ServicesSection', () => ({
  default: () => <section id="zabiegi">ServicesSection</section>,
}))

vi.mock('@features/contact/sections/ContactSection', () => ({
  default: () => <section id="kontakt">ContactSection</section>,
}))

vi.mock('../sections/GallerySection', () => ({
  default: () => <section id="galeria">GallerySection</section>,
}))

vi.mock('../sections/EffectsGallerySection', () => ({
  default: () => <section id="efekty">EffectsGallerySection</section>,
}))

vi.mock('../sections/AboutSection', () => ({
  default: () => <section id="o-mnie">AboutSection</section>,
}))

vi.mock('../sections/ProcessSection', () => ({
  default: () => <section id="proces">ProcessSection</section>,
}))

vi.mock('../sections/QuoteSection', () => ({
  default: () => <section>QuoteSection</section>,
}))

vi.mock('../sections/HeroSection', () => ({
  default: () => <section id="hero">HeroSection</section>,
}))

vi.mock('../sections/OpinionsSection', () => ({
  default: () => <section id="opinie">OpinionsSection</section>,
}))

import HomePage from './HomePage'

let idleCallback: IdleRequestCallback | null = null

describe('HomePage', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    window.history.replaceState(null, '', '/')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    idleCallback = null

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as typeof window.matchMedia,
    })

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
      },
    )

    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((callback: IdleRequestCallback) => {
        idleCallback = callback
        return 1
      }),
    )

    vi.stubGlobal('cancelIdleCallback', vi.fn())
  })

  it('renders the main page container with correct structure', () => {
    const { container } = render(<HomePage />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders core sections before deferred below-fold sections', async () => {
    const { getByText, findByText, queryByText } = render(<HomePage />)

    expect(getByText('HeroSection')).toBeInTheDocument()
    expect(await findByText('AboutSection')).toBeInTheDocument()
    expect(await findByText('ProcessSection')).toBeInTheDocument()
    expect(await findByText('QuoteSection')).toBeInTheDocument()
    expect(await findByText('ServicesSection')).toBeInTheDocument()
    expect(queryByText('GallerySection')).not.toBeInTheDocument()
    expect(queryByText('EffectsGallerySection')).not.toBeInTheDocument()
    expect(queryByText('OpinionsSection')).not.toBeInTheDocument()
    expect(queryByText('ContactSection')).not.toBeInTheDocument()
    expect(queryByText('GoogleMap')).not.toBeInTheDocument()
  })

  it('renders deferred below-fold sections after idle work runs', async () => {
    const { findByText } = render(<HomePage />)

    act(() => {
      idleCallback?.({ didTimeout: false, timeRemaining: () => 10 })
    })

    expect(await findByText('GallerySection')).toBeInTheDocument()
    expect(await findByText('EffectsGallerySection')).toBeInTheDocument()
    expect(await findByText('OpinionsSection')).toBeInTheDocument()
    expect(await findByText('ContactSection')).toBeInTheDocument()
    expect(await findByText('GoogleMap')).toBeInTheDocument()
  })

  it('renders deferred sections immediately when the URL targets one', async () => {
    window.history.replaceState(null, '', '/#kontakt')

    const { findByText } = render(<HomePage />)

    expect(await findByText('ContactSection')).toBeInTheDocument()
    expect(await findByText('GoogleMap')).toBeInTheDocument()
  })
})
