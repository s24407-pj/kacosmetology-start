import '@testing-library/jest-dom/vitest'
import { ABOUT_SECTION } from '@data/about'
import { cleanup, render, screen, within } from '@testing-library/react'
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

  it('renders the original four-step process and anchor', () => {
    const { container } = render(<ProcessSection />)
    expect(container.querySelector('#wspolpraca')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: ABOUT_SECTION.processHeading }),
    ).toBeInTheDocument()
    const desktop = screen.getByRole('region', {
      name: ABOUT_SECTION.processHeading,
    })
    expect(within(desktop).getAllByRole('article')).toHaveLength(4)
    for (const step of ABOUT_SECTION.processSteps) {
      expect(
        screen.getAllByRole('heading', { name: step.title }).length,
      ).toBeGreaterThan(0)
    }
  })
})
