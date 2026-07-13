import '@testing-library/jest-dom/vitest'
import { ABOUT_SECTION } from '@data/about'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AboutVideo from './AboutVideo'

const PROCESS_VIDEO = ABOUT_SECTION.processSteps.find((step) => step.video)!
  .video!

function getVideoElement() {
  const element = screen.getByLabelText(PROCESS_VIDEO.alt)
  if (!(element instanceof HTMLVideoElement)) {
    throw new Error('Expected video element')
  }
  return element
}

describe('AboutVideo', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>
  let observerCallback: IntersectionObserverCallback | null = null

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    cleanup()
    observerCallback = null
    vi.unstubAllGlobals()
  })

  it('renders a hero-style autoplaying video without controls', () => {
    const { container } = render(<AboutVideo video={PROCESS_VIDEO} />)

    const video = screen.getByLabelText(PROCESS_VIDEO.alt)
    expect(video).toBeInTheDocument()
    expect(video).not.toHaveAttribute('poster')
    expect(video).not.toHaveAttribute('controls')
    expect(video).not.toHaveAttribute('autoplay')
    expect((video as HTMLVideoElement).muted).toBe(true)
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'none')
    expect(container.querySelector('img[aria-hidden="true"]')).toHaveAttribute(
      'src',
      '/movies/konsultacja-poster-720.webp',
    )
    expect(container.querySelector('.shadow-subtle')).toBeInTheDocument()
    expect(container.querySelector('.aspect-4\\/5')).toBeInTheDocument()
  })

  it('loads sources when the video enters the viewport', async () => {
    render(<AboutVideo video={PROCESS_VIDEO} />)

    const videoBeforeLoad = screen.getByLabelText(PROCESS_VIDEO.alt)
    expect(videoBeforeLoad.querySelectorAll('source')).toHaveLength(0)

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    await waitFor(() => {
      const video = screen.getByLabelText(PROCESS_VIDEO.alt)
      const sources = video.querySelectorAll('source')
      expect(sources).toHaveLength(2)
      expect(sources[0]).toHaveAttribute('src', PROCESS_VIDEO.sources.webm)
      expect(sources[1]).toHaveAttribute('src', PROCESS_VIDEO.sources.mp4)
      expect(video).toHaveAttribute('preload', 'auto')
    })
  })

  it('shows poster image only when reduced motion is preferred', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<AboutVideo video={PROCESS_VIDEO} />)

    expect(screen.queryByLabelText(PROCESS_VIDEO.alt)).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: PROCESS_VIDEO.alt }),
    ).toHaveAttribute('src', '/movies/konsultacja-poster-720.webp')
  })

  it('renders embedded variant without standalone chrome', () => {
    const { container } = render(
      <AboutVideo video={PROCESS_VIDEO} variant="embedded" />,
    )

    expect(container.querySelector('.shadow-subtle')).not.toBeInTheDocument()
    expect(container.querySelector('.aspect-4\\/5')).toBeInTheDocument()
    expect(container.querySelector('.bg-black\\/10')).not.toBeInTheDocument()
  })

  it('does not load inactive embedded video sources on viewport entry', () => {
    render(
      <AboutVideo video={PROCESS_VIDEO} variant="embedded" active={false} />,
    )

    const video = getVideoElement()
    const playMock = vi.fn().mockResolvedValue(undefined)
    video.play = playMock

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(video.querySelectorAll('source')).toHaveLength(0)
    expect(video).toHaveAttribute('preload', 'none')
    expect(playMock).not.toHaveBeenCalled()
  })

  it('loads an embedded video after it becomes active while visible', async () => {
    const { rerender } = render(
      <AboutVideo video={PROCESS_VIDEO} variant="embedded" active={false} />,
    )

    let video = getVideoElement()
    const playMock = vi.fn().mockResolvedValue(undefined)
    video.play = playMock

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(video.querySelectorAll('source')).toHaveLength(0)

    rerender(<AboutVideo video={PROCESS_VIDEO} variant="embedded" active />)

    await waitFor(() => {
      video = getVideoElement()
      expect(video.querySelectorAll('source')).toHaveLength(2)
      expect(video).toHaveAttribute('preload', 'auto')
      expect(playMock).toHaveBeenCalled()
    })
  })

  it('keeps loaded embedded video sources when it becomes inactive', async () => {
    const { rerender } = render(
      <AboutVideo video={PROCESS_VIDEO} variant="embedded" active />,
    )

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    await waitFor(() => {
      expect(getVideoElement().querySelectorAll('source')).toHaveLength(2)
    })

    rerender(
      <AboutVideo video={PROCESS_VIDEO} variant="embedded" active={false} />,
    )

    const video = getVideoElement()
    expect(video.querySelectorAll('source')).toHaveLength(2)
    expect(video).toHaveAttribute('preload', 'auto')
    expect(video).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows poster only when active is false', () => {
    const { container } = render(
      <AboutVideo video={PROCESS_VIDEO} active={false} />,
    )

    expect(
      screen.getByRole('img', { name: PROCESS_VIDEO.alt }),
    ).toHaveAttribute('src', '/movies/konsultacja-poster-720.webp')
    expect(container.querySelector('video')).not.toBeInTheDocument()
  })

  it('does not loop when loop is false', () => {
    render(<AboutVideo video={PROCESS_VIDEO} loop={false} />)

    const video = screen.getByLabelText(PROCESS_VIDEO.alt)
    expect(video).not.toHaveAttribute('loop')
  })

  it('calls onEnded when the video finishes', async () => {
    const onEnded = vi.fn()
    render(<AboutVideo video={PROCESS_VIDEO} loop={false} onEnded={onEnded} />)

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(PROCESS_VIDEO.alt)).toBeInTheDocument()
    })

    fireEvent.ended(screen.getByLabelText(PROCESS_VIDEO.alt))
    expect(onEnded).toHaveBeenCalledOnce()
  })

  it('pauses the video when it leaves the viewport', async () => {
    render(<AboutVideo video={PROCESS_VIDEO} />)

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    await waitFor(() => {
      expect(
        screen.getByLabelText(PROCESS_VIDEO.alt).querySelectorAll('source'),
      ).toHaveLength(2)
    })

    const video = getVideoElement()
    const pauseMock = vi.fn()
    video.play = vi.fn().mockResolvedValue(undefined)
    video.pause = pauseMock

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    observerCallback?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(pauseMock).toHaveBeenCalled()
  })

  it('resumes the video when it re-enters the viewport', async () => {
    render(<AboutVideo video={PROCESS_VIDEO} />)

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    await waitFor(() => {
      expect(
        screen.getByLabelText(PROCESS_VIDEO.alt).querySelectorAll('source'),
      ).toHaveLength(2)
    })

    const video = getVideoElement()
    const playMock = vi.fn().mockResolvedValue(undefined)
    video.play = playMock
    video.pause = vi.fn()

    observerCallback?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    playMock.mockClear()

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(playMock).toHaveBeenCalled()
  })
})
