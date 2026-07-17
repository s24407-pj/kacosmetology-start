import { brand } from '@data/business'

type AnalyticsEventValue = string | number | boolean

export type AnalyticsEventProps = Record<string, AnalyticsEventValue>

type PlausibleModule = typeof import('@plausible-analytics/tracker')
type PlausibleEventOptions =
  import('@plausible-analytics/tracker').PlausibleEventOptions

let analyticsInitialized = false
let analyticsInitFailed = false
let plausibleLoadPromise: Promise<PlausibleModule | null> | null = null

function prefetchAnalyticsDns() {
  if (typeof document === 'undefined') {
    return
  }

  if (document.querySelector('link[data-analytics-dns-prefetch]')) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = 'https://analytics.mflisik.ovh'
  link.setAttribute('data-analytics-dns-prefetch', '')
  document.head.appendChild(link)
}

function loadPlausible(): Promise<PlausibleModule | null> {
  if (plausibleLoadPromise) {
    return plausibleLoadPromise
  }

  prefetchAnalyticsDns()
  plausibleLoadPromise = import('@plausible-analytics/tracker')
    .then((module) => {
      module.init({
        domain: new URL(brand.siteUrl).hostname,
        endpoint: 'https://analytics.mflisik.ovh/api/event',
      })
      analyticsInitialized = true
      return module
    })
    .catch(() => {
      analyticsInitFailed = true
      return null
    })

  return plausibleLoadPromise
}

export function initAnalytics() {
  if (
    analyticsInitialized ||
    analyticsInitFailed ||
    typeof window === 'undefined' ||
    import.meta.env.MODE === 'test'
  ) {
    return
  }

  void loadPlausible()
}

export function trackPlausibleEvent(
  eventName: string,
  props?: AnalyticsEventProps,
) {
  const isBrowser = typeof window !== 'undefined'
  const isTestEnvironment = import.meta.env.MODE === 'test'

  if (!isBrowser || isTestEnvironment) {
    return
  }

  void loadPlausible().then((module) => {
    if (!module || !analyticsInitialized) {
      return
    }

    module.track(eventName, props ? ({ props } as PlausibleEventOptions) : {})
  })
}
