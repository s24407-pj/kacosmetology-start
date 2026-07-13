import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from './useCountUp'

function Counter({
  target,
  duration = 1500,
}: {
  target: number
  duration?: number
}) {
  const [ref, value] = useCountUp(target, duration)
  return (
    <span ref={ref} data-testid="counter">
      {value}
    </span>
  )
}

describe('useCountUp', () => {
  let rafCallback: FrameRequestCallback | null = null
  let observeMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    rafCallback = null
    observeMock = vi.fn()

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
      vi.fn(function (this: void, callback: IntersectionObserverCallback) {
        return {
          observe: observeMock.mockImplementation((element: Element) => {
            callback(
              [
                {
                  isIntersecting: true,
                  target: element,
                } as IntersectionObserverEntry,
              ],
              {} as IntersectionObserver,
            )
          }),
          disconnect: vi.fn(),
          unobserve: vi.fn(),
        }
      }),
    )

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallback = callback
      return 1
    })
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the final value immediately when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as typeof window.matchMedia,
    })

    render(<Counter target={42} />)

    expect(screen.getByTestId('counter')).toHaveTextContent('42')
  })

  it('animates toward the target when the element enters the viewport', async () => {
    const { rerender } = render(<Counter target={100} duration={1000} />)

    expect(screen.getByTestId('counter')).toHaveTextContent('0')

    rerender(<Counter target={100} duration={1001} />)

    await waitFor(() => expect(observeMock).toHaveBeenCalled())
    await waitFor(() => expect(rafCallback).not.toBeNull())

    act(() => {
      rafCallback?.(500)
    })
    expect(screen.getByTestId('counter')).toHaveTextContent('88')

    act(() => {
      rafCallback?.(1000)
    })
    expect(screen.getByTestId('counter')).toHaveTextContent('100')
  })
})
