import '@testing-library/jest-dom/vitest'
import { ABOUT_SECTION } from '@data/about'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
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
    const desktop = screen.getByRole('group', {
      name: ABOUT_SECTION.processHeading,
    })
    expect(within(desktop).getAllByRole('article')).toHaveLength(4)
    expect(
      within(desktop).getByRole('article', { current: 'step' }),
    ).toBeInTheDocument()
    expect(container.querySelector('ol')).toBeInTheDocument()
    for (const step of ABOUT_SECTION.processSteps) {
      expect(
        screen.getAllByRole('heading', { name: step.title }).length,
      ).toBeGreaterThan(0)
    }
  })

  it('activates a desktop step on hover', () => {
    render(<AboutProcessTimeline />)
    const desktop = screen.getByRole('group', {
      name: ABOUT_SECTION.processHeading,
    })
    const steps = within(desktop).getAllByRole('article')
    fireEvent.mouseEnter(steps[2]!)
    expect(steps[2]).toHaveAttribute('aria-current', 'step')
    const videos = desktop.querySelectorAll('video')
    expect(videos[2]).not.toHaveAttribute('aria-hidden')
    expect(videos[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('advances after the active video ends while autoplay is enabled', () => {
    render(<AboutProcessTimeline />)
    const desktop = screen.getByRole('group', {
      name: ABOUT_SECTION.processHeading,
    })
    const firstVideo = desktop.querySelectorAll('video')[0]
    if (firstVideo) fireEvent.ended(firstVideo)
    expect(desktop.querySelectorAll('video')[1]).not.toHaveAttribute(
      'aria-hidden',
    )
    expect(within(desktop).getAllByRole('article')[1]).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('does not advance after a manual step selection', () => {
    render(<AboutProcessTimeline />)
    const desktop = screen.getByRole('group', {
      name: ABOUT_SECTION.processHeading,
    })
    const steps = within(desktop).getAllByRole('article')
    fireEvent.focus(steps[1]!)
    const selectedVideo = desktop.querySelectorAll('video')[1]
    if (selectedVideo) fireEvent.ended(selectedVideo)
    expect(selectedVideo).not.toHaveAttribute('aria-hidden')
    expect(steps[1]).toHaveAttribute('aria-current', 'step')
  })
})
