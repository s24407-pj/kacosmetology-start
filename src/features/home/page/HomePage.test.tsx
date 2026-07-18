import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let currentHash = ''

vi.mock('@hooks/useScrollDepthTracking', () => ({
  useScrollDepthTracking: vi.fn(),
}))
vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: '/', hash: currentHash } }),
}))
vi.mock('../sections/HeroSection', () => ({
  default: () => <section>Hero</section>,
}))
vi.mock('../sections/AboutSection', () => ({
  default: () => <section>O mnie</section>,
}))
vi.mock('../sections/ProcessSection', () => ({
  default: () => <section>Proces</section>,
}))
vi.mock('../sections/SpecializationsSection', () => ({
  default: () => <section>Kosmetologia i Trychologia</section>,
}))
vi.mock('../sections/QuoteSection', () => ({
  default: () => <section>Holistycznie znaczy czule.</section>,
}))
vi.mock('../sections/OpinionsSection', () => ({
  default: () => <section id="opinie">Opinie</section>,
}))
vi.mock('@features/contact/sections/ContactSection', () => ({
  default: () => <section id="kontakt">Kontakt</section>,
}))
vi.mock('@features/contact/sections/GoogleMap', () => ({
  default: () => <section>Mapa Google</section>,
}))

import HomePage from './HomePage'

let idleCallback: IdleRequestCallback | undefined

describe('HomePage', () => {
  beforeEach(() => {
    currentHash = ''
    idleCallback = undefined
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((callback: IdleRequestCallback) => {
        idleCallback = callback
        return 1
      }),
    )
    vi.stubGlobal('cancelIdleCallback', vi.fn())
  })

  afterEach(() => {
    cleanup()
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps below-fold sections off the initial render path', () => {
    render(<HomePage />)
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Kosmetologia i Trychologia')).toBeInTheDocument()
    expect(screen.getByText('Holistycznie znaczy czule.')).toBeInTheDocument()
    expect(screen.queryByText('Opinie')).not.toBeInTheDocument()
    expect(screen.queryByText('Kontakt')).not.toBeInTheDocument()
    expect(screen.queryByText('Mapa Google')).not.toBeInTheDocument()
    expect(screen.queryByText('ServicesSection')).not.toBeInTheDocument()
    expect(screen.queryByText('Galeria')).not.toBeInTheDocument()
  })

  it('mounts below-fold sections when idle work runs', async () => {
    render(<HomePage />)

    act(() => {
      idleCallback?.({ didTimeout: false, timeRemaining: () => 10 })
    })

    expect(await screen.findByText('Opinie')).toBeInTheDocument()
    expect(screen.getByText('Kontakt')).toBeInTheDocument()
    expect(screen.getByText('Mapa Google')).toBeInTheDocument()
  })

  it('mounts a directly requested deferred section and retries scrolling', async () => {
    currentHash = 'kontakt'
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })

    render(<HomePage />)

    expect(await screen.findByText('Kontakt')).toBeInTheDocument()
    await vi.waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
    })
  })
})
