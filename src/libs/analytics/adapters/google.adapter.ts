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

export function createGoogleAdapter(): AnalyticsAdapter | null {
  const measurementId = getGaId()
  if (!measurementId) {
    return null
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

      // Defaults denied; facade immediately syncs real category grants.
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })
      window.gtag('js', new Date())
      window.gtag('config', measurementId, {
        send_page_view: false,
      })

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
    },
    trackPageView(data: PageViewEvent) {
      window.gtag?.('event', 'page_view', {
        page_path: data.path,
        page_title: data.title,
      })
    },
    trackInitiateCheckout(data: InitiateCheckoutEvent) {
      window.gtag?.('event', 'begin_checkout', {
        placement: data.placement,
        item_name: data.serviceName,
        item_category: data.serviceCategory,
        destination_url: data.destinationUrl,
        ...data.attribution,
      })
    },
    trackPurchase(data: PurchaseEvent) {
      window.gtag?.('event', 'purchase', {
        transaction_id: data.bookingId,
        value: data.value,
        currency: data.currency,
        item_category: data.serviceCategory,
      })
    },
    trackLead(data: LeadEvent) {
      window.gtag?.('event', 'generate_lead', {
        channel: data.channel,
        placement: data.placement,
      })
    },
  }

  return adapter
}
