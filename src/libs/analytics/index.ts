import { createGoogleAdapter } from './adapters/google.adapter'
import { createMetaAdapter } from './adapters/meta.adapter'
import { createOpenAiAdapter } from './adapters/openai.adapter'
import { createPlausibleAdapter } from './adapters/plausible.adapter'
import { captureAttribution, getAttributionContext } from './attribution'
import type {
  AnalyticsAdapter,
  ConsentSettings,
  InitiateCheckoutEvent,
  LeadEvent,
  PageViewEvent,
  PurchaseEvent,
} from './types'

type FacadeOptions = {
  /** When true, methods run even if `import.meta.env.MODE === 'test'`. */
  enableInTest?: boolean
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function isTestEnvironment() {
  return import.meta.env.MODE === 'test'
}

function collectAdapters(): AnalyticsAdapter[] {
  return [
    createPlausibleAdapter(),
    createGoogleAdapter(),
    createMetaAdapter(),
    createOpenAiAdapter(),
  ].filter((adapter): adapter is AnalyticsAdapter => adapter !== null)
}

function isCategoryGranted(
  category: NonNullable<AnalyticsAdapter['consentCategory']>,
  consent: ConsentSettings,
): boolean {
  return category === 'analytics' ? consent.analytics : consent.marketing
}

function isCategoryAllowed(
  adapter: AnalyticsAdapter,
  consent: ConsentSettings,
): boolean {
  if (adapter.consentCategories?.length) {
    return adapter.consentCategories.some((category) =>
      isCategoryGranted(category, consent),
    )
  }

  if (!adapter.consentCategory) {
    return true
  }

  return isCategoryGranted(adapter.consentCategory, consent)
}

function isConsentGated(adapter: AnalyticsAdapter): boolean {
  return Boolean(adapter.consentCategory || adapter.consentCategories?.length)
}

function createAnalyticsFacade(
  adapters: AnalyticsAdapter[],
  options: FacadeOptions = {},
) {
  let bootstrapped = false
  let consent: ConsentSettings = {
    analytics: false,
    marketing: false,
  }

  const shouldSkipRuntime = () => {
    if (!isBrowser()) {
      return true
    }

    if (isTestEnvironment() && !options.enableInTest) {
      return true
    }

    return false
  }

  const forAllowedAdapters = (
    run: (adapter: AnalyticsAdapter) => void,
  ): void => {
    for (const adapter of adapters) {
      if (!adapter.isInitialized || !isCategoryAllowed(adapter, consent)) {
        continue
      }

      try {
        run(adapter)
      } catch {
        // Adapter failures must not break UX.
      }
    }
  }

  return {
    init() {
      if (shouldSkipRuntime() || bootstrapped) {
        return
      }

      bootstrapped = true
      captureAttribution()

      for (const adapter of adapters) {
        if (isConsentGated(adapter)) {
          continue
        }

        try {
          adapter.init()
        } catch {
          // Cookieless adapter init failure is non-fatal.
        }
      }
    },

    updateConsent(next: ConsentSettings) {
      if (shouldSkipRuntime()) {
        return
      }

      if (!bootstrapped) {
        this.init()
      }

      consent = {
        analytics: next.analytics,
        marketing: next.marketing,
      }

      for (const adapter of adapters) {
        if (!isConsentGated(adapter)) {
          continue
        }

        const allowed = isCategoryAllowed(adapter, consent)

        if (allowed && !adapter.isInitialized) {
          try {
            adapter.init()
          } catch {
            // Consent-gated init failure is non-fatal.
          }
        }

        if (adapter.isInitialized) {
          try {
            adapter.applyConsent?.(consent)
          } catch {
            // Consent sync failure is non-fatal.
          }
        }
      }
    },

    trackPageView(data: PageViewEvent) {
      if (shouldSkipRuntime()) {
        return
      }

      forAllowedAdapters((adapter) => adapter.trackPageView?.(data))
    },

    trackInitiateCheckout(data: Omit<InitiateCheckoutEvent, 'attribution'>) {
      if (shouldSkipRuntime()) {
        return
      }

      const payload: InitiateCheckoutEvent = {
        ...data,
        attribution: getAttributionContext(),
      }

      forAllowedAdapters((adapter) => adapter.trackInitiateCheckout?.(payload))
    },

    trackPurchase(data: PurchaseEvent) {
      if (shouldSkipRuntime()) {
        return
      }

      forAllowedAdapters((adapter) => adapter.trackPurchase?.(data))
    },

    trackLead(data: LeadEvent) {
      if (shouldSkipRuntime()) {
        return
      }

      forAllowedAdapters((adapter) => adapter.trackLead?.(data))
    },

    /** @internal Test seam: registered adapters. */
    getAdapters() {
      return adapters
    },
  }
}

const analytics = createAnalyticsFacade(collectAdapters())

export type {
  AnalyticsAdapter,
  AttributionContext,
  ConsentCategory,
  ConsentSettings,
  InitiateCheckoutEvent,
  LeadEvent,
  PageViewEvent,
  PurchaseEvent,
} from './types'
export { analytics }

/** @internal Deterministic facade factory for unit tests. */
export function createAnalyticsFacadeForTests(adapters: AnalyticsAdapter[]) {
  return createAnalyticsFacade(adapters, { enableInTest: true })
}
