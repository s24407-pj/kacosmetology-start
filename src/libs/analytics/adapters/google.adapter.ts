import { injectAsyncScript } from '../script'
import type {
  AnalyticsAdapter,
  ConsentSettings,
  InitiateCheckoutEvent,
  LeadEvent,
  PageViewEvent,
  PurchaseEvent,
} from '../types'

function getGaId(): string | undefined {
  const id = import.meta.env.VITE_GA_ID
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

function toConsentState(granted: boolean): 'granted' | 'denied' {
  return granted ? 'granted' : 'denied'
}

/**
 * EEA member states plus UK and Switzerland (where GDPR/ePrivacy equivalents apply).
 * Scoping consent defaults prevents Tag Quality alerts about 100% denied signals outside EEA.
 */
export const EEA_AND_UK_REGIONS = [
  'AT',
  'BE',
  'BG',
  'CH',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GB',
  'GR',
  'HR',
  'HU',
  'IE',
  'IS',
  'IT',
  'LI',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'NO',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
] as const

export function createGoogleAdapter(): AnalyticsAdapter | null {
  const measurementId = getGaId()
  if (!measurementId) {
    return null
  }

  let isConfigured = false
  let lastTrackedPath: string | null = null

  function ensureConfigured() {
    if (
      isConfigured ||
      typeof window === 'undefined' ||
      typeof window.gtag !== 'function'
    ) {
      return
    }

    window.gtag('config', measurementId, {
      send_page_view: false,
    })
    isConfigured = true
  }

  function sendPageView(path: string, title?: string) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return
    }

    if (lastTrackedPath === path) {
      return
    }

    lastTrackedPath = path
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    })
  }

  const adapter: AnalyticsAdapter = {
    name: 'google',
    consentCategories: ['analytics', 'marketing'],
    isInitialized: false,
    init() {
      if (adapter.isInitialized || typeof window === 'undefined') {
        return
      }

      window.dataLayer = window.dataLayer || []
      // gtag.js only drains pre-load queue entries that are Arguments objects,
      // not plain arrays from rest params — otherwise config/consent never apply.
      window.gtag = function gtag(..._args: unknown[]) {
        // biome-ignore lint/complexity/noArguments: required by gtag.js queue protocol
        window.dataLayer.push(arguments)
      }

      // Default denied scoped to EEA/UK; facade immediately syncs real category grants.
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        region: EEA_AND_UK_REGIONS,
      })
      window.gtag('js', new Date())

      injectAsyncScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
        'google-gtag',
      )

      adapter.isInitialized = true
    },
    applyConsent(settings: ConsentSettings) {
      if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
        return
      }

      window.gtag('consent', 'update', {
        analytics_storage: toConsentState(settings.analytics),
        ad_storage: toConsentState(settings.marketing),
        ad_user_data: toConsentState(settings.marketing),
        ad_personalization: toConsentState(settings.marketing),
      })

      // Configure container only after updating consent signals so Tag Assistant
      // / GA4 starts in the resolved consent state, not 'denied'.
      ensureConfigured()

      if (settings.analytics) {
        const currentPath =
          typeof window.location !== 'undefined'
            ? window.location.pathname
            : '/'
        const currentTitle =
          typeof document !== 'undefined' && document.title.length > 0
            ? document.title
            : undefined
        sendPageView(currentPath, currentTitle)
      } else {
        lastTrackedPath = null
      }
    },
    trackPageView(data: PageViewEvent) {
      ensureConfigured()
      sendPageView(data.path, data.title)
    },
    trackInitiateCheckout(data: InitiateCheckoutEvent) {
      ensureConfigured()
      window.gtag?.('event', 'begin_checkout', {
        placement: data.placement,
        item_name: data.serviceName,
        item_category: data.serviceCategory,
        destination_url: data.destinationUrl,
        ...data.attribution,
      })
    },
    trackPurchase(data: PurchaseEvent) {
      ensureConfigured()
      window.gtag?.('event', 'purchase', {
        transaction_id: data.bookingId,
        value: data.value,
        currency: data.currency,
        item_category: data.serviceCategory,
      })
    },
    trackLead(data: LeadEvent) {
      ensureConfigured()
      window.gtag?.('event', 'generate_lead', {
        channel: data.channel,
        placement: data.placement,
      })
    },
  }

  return adapter
}
