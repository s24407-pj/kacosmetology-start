import { brand } from '@data/business'

type AnalyticsEventValue = string | number | boolean

export type AnalyticsEventProps = Record<string, AnalyticsEventValue>

type PlausibleModule = typeof import('@plausible-analytics/tracker')
type PlausibleEventOptions =
  import('@plausible-analytics/tracker').PlausibleEventOptions

type AnalyticsModule = Pick<PlausibleModule, 'init' | 'track'>
type AnalyticsClientStatus =
  | 'idle'
  | 'loading'
  | 'retryable'
  | 'ready'
  | 'disabled'

interface AnalyticsClientDependencies {
  loadModule: () => Promise<AnalyticsModule>
  prefetchDns: () => void
  warn: (message: string) => void
}

const RETRYABLE_LOAD_WARNING =
  '[analytics] Plausible failed to load; one later retry remains.'
const TERMINAL_LOAD_WARNING =
  '[analytics] Plausible failed to load after retry; analytics disabled.'
const TERMINAL_INIT_WARNING =
  '[analytics] Plausible initialization failed; analytics disabled.'

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

/** @internal Deterministic lifecycle seam for analytics unit tests. */
export function createAnalyticsClient({
  loadModule,
  prefetchDns,
  warn,
}: AnalyticsClientDependencies) {
  let status: AnalyticsClientStatus = 'idle'
  let attempts = 0
  let dnsPrefetched = false
  let module: AnalyticsModule | null = null
  let loadPromise: Promise<AnalyticsModule | null> | null = null

  const load = (): Promise<AnalyticsModule | null> => {
    if (status === 'ready') {
      return Promise.resolve(module)
    }

    if (status === 'disabled') {
      return Promise.resolve(null)
    }

    if (loadPromise) {
      return loadPromise
    }

    status = 'loading'
    attempts += 1

    if (!dnsPrefetched) {
      prefetchDns()
      dnsPrefetched = true
    }

    loadPromise = Promise.resolve()
      .then(loadModule)
      .then(
        (loadedModule) => {
          try {
            loadedModule.init({
              domain: new URL(brand.siteUrl).hostname,
              endpoint: 'https://analytics.mflisik.ovh/api/event',
            })
          } catch {
            status = 'disabled'
            loadPromise = null
            warn(TERMINAL_INIT_WARNING)
            return null
          }

          module = loadedModule
          status = 'ready'
          return loadedModule
        },
        () => {
          loadPromise = null

          if (attempts === 1) {
            status = 'retryable'
            warn(RETRYABLE_LOAD_WARNING)
          } else {
            status = 'disabled'
            warn(TERMINAL_LOAD_WARNING)
          }

          return null
        },
      )

    return loadPromise
  }

  return {
    init() {
      void load()
    },
    track(eventName: string, props?: AnalyticsEventProps) {
      void load().then((loadedModule) => {
        if (!loadedModule || status !== 'ready') {
          return
        }

        loadedModule.track(
          eventName,
          props ? ({ props } as PlausibleEventOptions) : {},
        )
      })
    },
  }
}

const analyticsClient = createAnalyticsClient({
  loadModule: () => import('@plausible-analytics/tracker'),
  prefetchDns: prefetchAnalyticsDns,
  warn: (message) => console.warn(message),
})

export function initAnalytics() {
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') {
    return
  }

  analyticsClient.init()
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

  analyticsClient.track(eventName, props)
}
