import { injectAsyncScript } from '../script'
import type {
  AnalyticsAdapter,
  InitiateCheckoutEvent,
  LeadEvent,
  PurchaseEvent,
} from '../types'

function getOpenAiPixelId(): string | undefined {
  const id = import.meta.env.VITE_OPENAI_PIXEL_ID
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

type OaiqStub = Window['oaiq'] & {
  queue: Array<[string, string?, Record<string, unknown>?]>
}

function ensureOaiqStub() {
  if (typeof window.oaiq === 'function') {
    return
  }

  const oaiq = function oaiq(
    action: string,
    eventName?: string,
    params?: Record<string, unknown>,
  ) {
    ;(oaiq as OaiqStub).queue.push([action, eventName, params])
  } as OaiqStub

  oaiq.queue = []
  window.oaiq = oaiq
}

export function createOpenAiAdapter(): AnalyticsAdapter | null {
  const pixelId = getOpenAiPixelId()
  if (!pixelId) {
    return null
  }

  const adapter: AnalyticsAdapter = {
    name: 'openai',
    consentCategory: 'marketing',
    isInitialized: false,
    init() {
      if (adapter.isInitialized || typeof window === 'undefined') {
        return
      }

      ensureOaiqStub()
      injectAsyncScript(
        'https://static.ads.openai.com/pixel.js',
        'openai-pixel',
      )
      window.oaiq('init', pixelId)
      adapter.isInitialized = true
    },
    trackInitiateCheckout(data: InitiateCheckoutEvent) {
      window.oaiq?.('measure', 'checkout_initiated', {
        placement: data.placement,
        service_name: data.serviceName,
        service_category: data.serviceCategory,
        destination_url: data.destinationUrl,
        ...data.attribution,
      })
    },
    trackPurchase(data: PurchaseEvent) {
      window.oaiq?.('measure', 'purchase', {
        booking_id: data.bookingId,
        value: data.value,
        currency: data.currency,
        service_category: data.serviceCategory,
      })
    },
    trackLead(data: LeadEvent) {
      window.oaiq?.('measure', 'lead', {
        channel: data.channel,
        placement: data.placement,
      })
    },
  }

  return adapter
}
