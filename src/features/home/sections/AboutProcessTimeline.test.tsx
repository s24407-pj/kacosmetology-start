import '@testing-library/jest-dom/vitest'
import { ABOUT_SECTION } from '@data/about'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AboutProcessTimeline from './AboutProcessTimeline'

describe('AboutProcessTimeline', () => {
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

  it('renders all four steps in desktop and mobile layouts', () => {
    const { container } = render(<AboutProcessTimeline />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(container.querySelector('ol')).toBeInTheDocument()
    for (const step of ABOUT_SECTION.processSteps) {
      expect(
        screen.getAllByRole('heading', { name: step.title }).length,
      ).toBeGreaterThan(0)
    }
  })

  it('activates a desktop step on hover', () => {
    render(<AboutProcessTimeline />)
    fireEvent.mouseEnter(screen.getAllByRole('tab')[2]!)
    const desktop = screen.getByRole('tablist')
    const videos = desktop?.querySelectorAll('video')
    expect(videos?.[2]).not.toHaveAttribute('aria-hidden')
    expect(videos?.[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('advances after the active video ends while autoplay is enabled', () => {
    render(<AboutProcessTimeline />)
    const desktop = screen.getByRole('tablist')
    const firstVideo = desktop?.querySelectorAll('video')[0]
    if (firstVideo) fireEvent.ended(firstVideo)
    expect(desktop?.querySelectorAll('video')[1]).not.toHaveAttribute(
      'aria-hidden',
    )
  })

  it('does not advance after a manual step selection', () => {
    render(<AboutProcessTimeline />)
    fireEvent.focus(screen.getAllByRole('tab')[1]!)
    const desktop = screen.getByRole('tablist')
    const selectedVideo = desktop?.querySelectorAll('video')[1]
    if (selectedVideo) fireEvent.ended(selectedVideo)
    expect(selectedVideo).not.toHaveAttribute('aria-hidden')
  })
})
