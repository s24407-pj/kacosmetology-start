import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from './useCountUp'

function Counter({
  target,
  duration = 1500,
  decimals = 0,
}: {
  target: number
  duration?: number
  decimals?: number
}) {
  const [ref, value] = useCountUp(target, duration, decimals)
  return (
    <span ref={ref} data-testid="counter">
      {value}
    </span>
  )
}

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia,
  })
}

describe('useCountUp', () => {
  let rafCallback: FrameRequestCallback | null = null
  let observerCallback: IntersectionObserverCallback | null = null
  let observeMock: ReturnType<typeof vi.fn>

  const intersect = (isIntersecting: boolean) => {
    act(() => {
      observerCallback?.(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
  }

  beforeEach(() => {
    rafCallback = null
    observerCallback = null
    observeMock = vi.fn()
    mockMatchMedia(false)

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (this: void, callback: IntersectionObserverCallback) {
        observerCallback = callback
        return {
          observe: observeMock,
          disconnect: vi.fn(),
          unobserve: vi.fn(),
        }
      }),
    )

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallback = callback
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('server-renders the final value so crawlers and first paint see it', () => {
    mockMatchMedia(true)

    const html = renderToString(<Counter target={5} decimals={1} />)
    expect(html).toContain('5.0')
  })

  it('shows the final value immediately when reduced motion is preferred', () => {
    mockMatchMedia(true)

    render(<Counter target={42} />)

    expect(screen.getByTestId('counter')).toHaveTextContent('42')
    expect(observeMock).not.toHaveBeenCalled()
  })

  it('keeps the final value for a counter already visible on mount', async () => {
    render(<Counter target={42} />)
    await waitFor(() => expect(observeMock).toHaveBeenCalled())

    intersect(true)

    expect(screen.getByTestId('counter')).toHaveTextContent('42')
    expect(rafCallback).toBeNull()
  })

  it('resets an off-screen counter and animates it when it enters the viewport', async () => {
    render(<Counter target={100} duration={1000} />)
    expect(screen.getByTestId('counter')).toHaveTextContent('100')
    await waitFor(() => expect(observeMock).toHaveBeenCalled())

    intersect(false)
    expect(screen.getByTestId('counter')).toHaveTextContent('0')

    intersect(true)
    expect(rafCallback).not.toBeNull()

    act(() => {
      rafCallback?.(500)
    })
    expect(screen.getByTestId('counter')).toHaveTextContent('88')

    act(() => {
      rafCallback?.(1000)
    })
    expect(screen.getByTestId('counter')).toHaveTextContent('100')
  })

  it('finishes immediately when reduced motion is enabled during the animation', async () => {
    let listener: (() => void) | undefined
    const media = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn((_event: string, callback: () => void) => {
        listener = callback
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => media),
    })

    render(<Counter target={42} />)
    await waitFor(() => expect(observeMock).toHaveBeenCalled())
    intersect(false)
    intersect(true)
    act(() => {
      rafCallback?.(100)
    })
    expect(screen.getByTestId('counter')).not.toHaveTextContent('42')

    act(() => {
      media.matches = true
      listener?.()
    })

    expect(screen.getByTestId('counter')).toHaveTextContent('42')
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })
})
