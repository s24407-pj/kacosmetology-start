import { trackPlausibleEvent } from '@libs/analytics'
import { useEffect } from 'react'

const DEFAULT_THRESHOLDS = [25, 50, 75, 100] as const

type ScrollDepthThreshold = number

export type ScrollDepthTrackingOptions = {
  eventName?: string
  thresholds?: ReadonlyArray<ScrollDepthThreshold>
  trackEvent?: typeof trackPlausibleEvent
}

const getDocumentHeight = () => {
  const { documentElement, body } = document

  const bodyScrollHeight = body?.scrollHeight ?? 0
  const bodyOffsetHeight = body?.offsetHeight ?? 0
  const bodyClientHeight = body?.clientHeight ?? 0

  const elementScrollHeight = documentElement.scrollHeight
  const elementOffsetHeight = documentElement.offsetHeight
  const elementClientHeight = documentElement.clientHeight

  return Math.max(
    elementScrollHeight,
    elementOffsetHeight,
    elementClientHeight,
    bodyScrollHeight,
    bodyOffsetHeight,
    bodyClientHeight,
  )
}

const getScrollTop = () => {
  const { documentElement, body } = document

  return (
    window.scrollY ??
    window.pageYOffset ??
    documentElement.scrollTop ??
    body?.scrollTop ??
    0
  )
}

const getViewportHeight = () =>
  window.innerHeight || document.documentElement.clientHeight

const sanitizeThresholds = (thresholds: ReadonlyArray<ScrollDepthThreshold>) =>
  [
    ...new Set(
      thresholds
        .filter((threshold) => Number.isFinite(threshold) && threshold > 0)
        .map((threshold) => Math.min(100, threshold)),
    ),
  ].sort((first, second) => first - second)

export const useScrollDepthTracking = ({
  eventName = 'Scroll Depth',
  thresholds = DEFAULT_THRESHOLDS,
  trackEvent = trackPlausibleEvent,
}: ScrollDepthTrackingOptions = {}) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const sortedThresholds = sanitizeThresholds(thresholds)

    if (sortedThresholds.length === 0) {
      return undefined
    }

    const trackedThresholds = new Set<number>()

    const supportsAnimationFrame =
      typeof window.requestAnimationFrame === 'function' &&
      typeof window.cancelAnimationFrame === 'function'

    const requestFrame = supportsAnimationFrame
      ? (callback: FrameRequestCallback) =>
          window.requestAnimationFrame(callback)
      : (callback: FrameRequestCallback) =>
          window.setTimeout(
            () =>
              callback(
                typeof window.performance === 'undefined'
                  ? Date.now()
                  : window.performance.now(),
              ),
            16,
          )

    const cancelFrame = supportsAnimationFrame
      ? (handle: number) => window.cancelAnimationFrame(handle)
      : (handle: number) => window.clearTimeout(handle)

    let frameHandle: number | null = null

    const trackDepthIfNeeded = () => {
      frameHandle = null

      const documentHeight = getDocumentHeight()

      if (documentHeight === 0) {
        return
      }

      const viewportHeight = getViewportHeight()
      const scrollTop = getScrollTop()

      const depth = Math.min(
        100,
        Math.max(0, ((scrollTop + viewportHeight) / documentHeight) * 100),
      )

      for (const threshold of sortedThresholds) {
        if (!trackedThresholds.has(threshold) && depth >= threshold) {
          trackedThresholds.add(threshold)
          trackEvent(eventName, { depthPercentage: threshold })
        }
      }

      if (trackedThresholds.size === sortedThresholds.length) {
        window.removeEventListener('scroll', scheduleMeasurement)
        window.removeEventListener('resize', scheduleMeasurement)
      }
    }

    const scheduleMeasurement = () => {
      if (frameHandle !== null) {
        return
      }

      frameHandle = requestFrame(trackDepthIfNeeded)
    }

    window.addEventListener('scroll', scheduleMeasurement, { passive: true })
    window.addEventListener('resize', scheduleMeasurement)

    scheduleMeasurement()

    return () => {
      if (frameHandle !== null) {
        cancelFrame(frameHandle)
        frameHandle = null
      }

      window.removeEventListener('scroll', scheduleMeasurement)
      window.removeEventListener('resize', scheduleMeasurement)
    }
  }, [eventName, thresholds, trackEvent])
}
