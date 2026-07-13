import '@testing-library/jest-dom/vitest'
import { ABOUT_SECTION } from '@data/about'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProcessSection from './ProcessSection'

describe('ProcessSection', () => {
  beforeEach(() => {
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
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders inside a section with id wspolpraca', () => {
    const { container } = render(<ProcessSection />)
    expect(container.querySelector('section#wspolpraca')).toBeInTheDocument()
  })

  it('renders AboutProcessTimeline inside the section wrapper', () => {
    render(<ProcessSection />)
    expect(
      screen.getByRole('heading', {
        name: ABOUT_SECTION.processHeading,
        level: 2,
      }),
    ).toBeInTheDocument()
  })
})
