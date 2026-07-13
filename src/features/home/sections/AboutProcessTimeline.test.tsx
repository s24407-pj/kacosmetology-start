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

  it('renders process heading and all four steps', () => {
    render(<AboutProcessTimeline />)

    expect(
      screen.getByRole('heading', {
        name: ABOUT_SECTION.processHeading,
        level: 2,
      }),
    ).toBeInTheDocument()

    ABOUT_SECTION.processSteps.forEach(
      ({ title, description, step, image, video }) => {
        expect(
          screen.getAllByText(String(step).padStart(2, '0')).length,
        ).toBeGreaterThan(0)
        expect(
          screen.getAllByRole('heading', { name: title, level: 3 }).length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText(description).length).toBeGreaterThan(0)

        if (video) {
          expect(screen.getAllByLabelText(video.alt).length).toBeGreaterThan(0)
        } else if (image) {
          expect(
            screen.getAllByRole('img', { name: image.alt }).length,
          ).toBeGreaterThan(0)
        }
      },
    )
  })

  it('renders desktop and mobile timeline layouts', () => {
    const { container } = render(<AboutProcessTimeline />)

    expect(container.querySelector('.hidden.md\\:flex')).toBeInTheDocument()
    expect(container.querySelector('.md\\:hidden')).toBeInTheDocument()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })

  it('keeps all desktop accordion videos mounted but plays only the active one', () => {
    const { container } = render(<AboutProcessTimeline />)
    const desktop = container.querySelector('.hidden.md\\:flex')
    const videos = desktop?.querySelectorAll('video')

    expect(videos).toHaveLength(4)
    expect(videos?.[0]).not.toHaveAttribute('aria-hidden')
    expect(videos?.[1]).toHaveAttribute('aria-hidden', 'true')
    expect(videos?.[2]).toHaveAttribute('aria-hidden', 'true')
    expect(videos?.[3]).toHaveAttribute('aria-hidden', 'true')
  })

  it('activates step on hover', () => {
    const { container } = render(<AboutProcessTimeline />)
    const tabs = screen.getAllByRole('tab')
    const desktop = container.querySelector('.hidden.md\\:flex')

    fireEvent.mouseEnter(tabs[2])

    const videos = desktop?.querySelectorAll('video')
    expect(videos?.[2]).toHaveAttribute(
      'aria-label',
      ABOUT_SECTION.processSteps[2].video?.alt,
    )
    expect(videos?.[2]).not.toHaveAttribute('aria-hidden')
    expect(videos?.[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('advances to next step when active video ends and autoplay is on', () => {
    const { container } = render(<AboutProcessTimeline />)
    const desktop = container.querySelector('.hidden.md\\:flex')

    let videos = desktop?.querySelectorAll('video')
    expect(videos?.[0]).not.toHaveAttribute('aria-hidden')

    if (videos?.[0]) fireEvent.ended(videos[0])

    videos = desktop?.querySelectorAll('video')
    expect(videos?.[1]).not.toHaveAttribute('aria-hidden')
    expect(videos?.[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not advance on video end while hovered', () => {
    const { container } = render(<AboutProcessTimeline />)
    const desktop = container.querySelector('.hidden.md\\:flex')
    const tabs = screen.getAllByRole('tab')

    fireEvent.mouseEnter(tabs[1])

    let videos = desktop?.querySelectorAll('video')
    expect(videos?.[1]).not.toHaveAttribute('aria-hidden')

    if (videos?.[1]) fireEvent.ended(videos[1])

    videos = desktop?.querySelectorAll('video')
    expect(videos?.[1]).not.toHaveAttribute('aria-hidden')
    expect(videos?.[0]).toHaveAttribute('aria-hidden', 'true')
  })
})
