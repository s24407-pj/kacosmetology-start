import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'

vi.mock('./analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import {
  type ScrollDepthTrackingOptions,
  useScrollDepthTracking,
} from './useScrollDepthTracking'

const TestComponent = (options: ScrollDepthTrackingOptions) => {
  useScrollDepthTracking(options)

  return null
}

const setProperty = (target: object, property: string, value: unknown) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, property)

  Object.defineProperty(target, property, {
    configurable: true,
    writable: true,
    value,
  })

  return () => {
    if (descriptor) {
      Object.defineProperty(target, property, descriptor)
    } else {
      Reflect.deleteProperty(target, property)
    }
  }
}

describe('useScrollDepthTracking', () => {
  let restoreInnerHeight: () => void
  let restoreScrollY: () => void
  let restoreScrollHeight: () => void
  let restoreClientHeight: () => void
  let restoreBodyScrollHeight: () => void

  beforeEach(() => {
    vi.useFakeTimers()

    restoreInnerHeight = setProperty(window, 'innerHeight', 500)
    restoreScrollY = setProperty(window, 'scrollY', 0)

    restoreScrollHeight = setProperty(
      document.documentElement,
      'scrollHeight',
      2000,
    )
    restoreClientHeight = setProperty(
      document.documentElement,
      'clientHeight',
      2000,
    )
    restoreBodyScrollHeight = setProperty(document.body, 'scrollHeight', 2000)
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    cleanup()

    restoreInnerHeight()
    restoreScrollY()
    restoreScrollHeight()
    restoreClientHeight()
    restoreBodyScrollHeight()
  })

  it('tracks scroll depth thresholds as the user scrolls', () => {
    const trackEvent = vi.fn()

    render(<TestComponent trackEvent={trackEvent} />)

    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenNthCalledWith(1, 'Scroll Depth', {
      depthPercentage: 25,
    })

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 600,
    })
    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(2)
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'Scroll Depth', {
      depthPercentage: 50,
    })

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 1100,
    })
    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(3)
    expect(trackEvent).toHaveBeenNthCalledWith(3, 'Scroll Depth', {
      depthPercentage: 75,
    })

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 1500,
    })
    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(4)
    expect(trackEvent).toHaveBeenNthCalledWith(4, 'Scroll Depth', {
      depthPercentage: 100,
    })
  })

  it('does not emit events more than once per threshold', () => {
    const trackEvent = vi.fn()

    render(<TestComponent trackEvent={trackEvent} />)

    vi.runOnlyPendingTimers()

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 2000,
    })

    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(4)

    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(4)
  })

  it('supports custom event names and thresholds', () => {
    const trackEvent = vi.fn()

    render(
      <TestComponent
        eventName="Głębokość strony"
        thresholds={[25, 80]}
        trackEvent={trackEvent}
      />,
    )

    vi.runOnlyPendingTimers()

    restoreScrollY()
    restoreScrollY = setProperty(window, 'scrollY', 1100)
    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenNthCalledWith(1, 'Głębokość strony', {
      depthPercentage: 25,
    })
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'Głębokość strony', {
      depthPercentage: 80,
    })
  })

  it('sanitizes thresholds after clamping and removes listeners when complete', () => {
    const trackEvent = vi.fn()
    const removeEventListener = vi.spyOn(window, 'removeEventListener')

    render(
      <TestComponent
        thresholds={[-10, 0, 25, 100, 150, 100, Number.NaN, Infinity]}
        trackEvent={trackEvent}
      />,
    )

    vi.runOnlyPendingTimers()
    restoreScrollY()
    restoreScrollY = setProperty(window, 'scrollY', 1500)
    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledTimes(2)
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'Scroll Depth', {
      depthPercentage: 100,
    })
    expect(removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    )
    expect(removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
  })

  it('measures scroll depth after a resize', () => {
    const trackEvent = vi.fn()

    render(<TestComponent thresholds={[50]} trackEvent={trackEvent} />)

    vi.runOnlyPendingTimers()
    expect(trackEvent).not.toHaveBeenCalled()

    restoreInnerHeight()
    restoreInnerHeight = setProperty(window, 'innerHeight', 1000)
    window.dispatchEvent(new Event('resize'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).toHaveBeenCalledWith('Scroll Depth', {
      depthPercentage: 50,
    })
  })

  it('uses a timeout when requestAnimationFrame is unavailable', () => {
    const trackEvent = vi.fn()
    const restoreRequestAnimationFrame = setProperty(
      window,
      'requestAnimationFrame',
      undefined,
    )
    const setTimeout = vi.spyOn(window, 'setTimeout')

    render(<TestComponent thresholds={[25]} trackEvent={trackEvent} />)

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 16)
    vi.advanceTimersByTime(16)
    expect(trackEvent).toHaveBeenCalledWith('Scroll Depth', {
      depthPercentage: 25,
    })

    restoreRequestAnimationFrame()
  })

  it('cancels pending measurements and removes listeners on unmount', () => {
    const trackEvent = vi.fn()
    const restoreRequestAnimationFrame = setProperty(
      window,
      'requestAnimationFrame',
      undefined,
    )
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const clearTimeout = vi.spyOn(window, 'clearTimeout')

    const { unmount } = render(
      <TestComponent thresholds={[100]} trackEvent={trackEvent} />,
    )
    unmount()
    window.dispatchEvent(new Event('scroll'))
    vi.runOnlyPendingTimers()

    expect(trackEvent).not.toHaveBeenCalled()
    expect(clearTimeout).toHaveBeenCalled()
    expect(removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    )
    expect(removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )

    restoreRequestAnimationFrame()
  })
})
