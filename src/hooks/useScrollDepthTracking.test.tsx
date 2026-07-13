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

const TestComponent = ({
  trackEvent,
}: {
  trackEvent: ScrollDepthTrackingOptions['trackEvent']
}) => {
  useScrollDepthTracking({ trackEvent })

  return null
}

const setNumericProperty = (
  target: object,
  property: string,
  value: number,
) => {
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

    restoreInnerHeight = setNumericProperty(window, 'innerHeight', 500)
    restoreScrollY = setNumericProperty(window, 'scrollY', 0)

    restoreScrollHeight = setNumericProperty(
      document.documentElement,
      'scrollHeight',
      2000,
    )
    restoreClientHeight = setNumericProperty(
      document.documentElement,
      'clientHeight',
      2000,
    )
    restoreBodyScrollHeight = setNumericProperty(
      document.body,
      'scrollHeight',
      2000,
    )
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
})
