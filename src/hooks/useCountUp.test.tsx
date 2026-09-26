import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from './useCountUp'

function Counter({
  target,
  decimals = 0,
}: {
  target: number
  decimals?: number
}) {
  const [ref, value] = useCountUp(target, 1000, decimals)
  return (
    <span ref={ref} data-testid="counter">
      {value}
    </span>
  )
}

function stubReducedMotion(initial: boolean) {
  let listener: (() => void) | undefined
  const media = {
    matches: initial,
    addEventListener: vi.fn((_event: string, callback: () => void) => {
      listener = callback
    }),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  )
  return (matches: boolean) =>
    act(() => {
      media.matches = matches
      listener?.()
    })
}

describe('useCountUp', () => {
  let rafCallback: FrameRequestCallback | null
  let observerCallback: IntersectionObserverCallback | null
  let observe: ReturnType<typeof vi.fn>

  const intersect = (isIntersecting: boolean) =>
    act(() => {
      observerCallback?.(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
  const counterValue = () => Number(screen.getByTestId('counter').textContent)

  beforeEach(() => {
    rafCallback = null
    observerCallback = null
    observe = vi.fn()
    stubReducedMotion(false)
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (this: void, callback: IntersectionObserverCallback) {
        observerCallback = callback
        return { observe, disconnect: vi.fn(), unobserve: vi.fn() }
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

  it('server-renders the final value for crawlers and first paint', () => {
    expect(renderToString(<Counter target={5} decimals={1} />)).toContain('5.0')
  })

  it('hydrates without a mismatch and keeps a visible counter at its final value', async () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(<Counter target={42} />)
    document.body.append(container)
    const onRecoverableError = vi.fn()
    let root: Root | undefined

    await act(async () => {
      root = hydrateRoot(container, <Counter target={42} />, {
        onRecoverableError,
      })
    })
    intersect(true)

    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(container).toHaveTextContent('42')
    act(() => root?.unmount())
    container.remove()
  })

  it('shows the final value without animating when reduced motion is preferred', () => {
    stubReducedMotion(true)
    render(<Counter target={42} />)

    expect(screen.getByTestId('counter')).toHaveTextContent('42')
    expect(observe).not.toHaveBeenCalled()
  })

  it('animates an off-screen counter from zero to its target once it scrolls into view', async () => {
    render(<Counter target={100} />)
    await waitFor(() => expect(observe).toHaveBeenCalled())

    intersect(false)
    expect(counterValue()).toBe(0)

    intersect(true)
    act(() => rafCallback?.(500))
    expect(counterValue()).toBeGreaterThan(0)
    expect(counterValue()).toBeLessThan(100)

    act(() => rafCallback?.(1000))
    expect(counterValue()).toBe(100)
  })

  it('jumps to the final value when reduced motion is enabled mid-animation', async () => {
    const setReducedMotion = stubReducedMotion(false)
    render(<Counter target={42} />)
    await waitFor(() => expect(observe).toHaveBeenCalled())
    intersect(false)
    intersect(true)
    act(() => rafCallback?.(100))

    setReducedMotion(true)

    expect(screen.getByTestId('counter')).toHaveTextContent('42')
  })
})
