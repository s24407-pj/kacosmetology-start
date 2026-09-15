import { injectAsyncScript } from '../script'
import type {
  AnalyticsAdapter,
  InitiateCheckoutEvent,
  LeadEvent,
  PurchaseEvent,
} from '../types'

function getMetaPixelId(): string | undefined {
  const id = import.meta.env.VITE_META_PIXEL_ID
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

type FbqStub = Window['fbq'] & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  loaded: boolean
  version: string
  push: Window['fbq']
}

function ensureFbqStub() {
  if (typeof window.fbq === 'function') {
    return
  }

  const fbq = function fbq(...args: unknown[]) {
    const stub = fbq as FbqStub
    if (stub.callMethod) {
      stub.callMethod(...args)
    } else {
      stub.queue.push(args)
    }
  } as FbqStub

  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.push = fbq
  window.fbq = fbq
}

export function createMetaAdapter(): AnalyticsAdapter | null {
  const pixelId = getMetaPixelId()
  if (!pixelId) {
    return null
  }

  const adapter: AnalyticsAdapter = {
    name: 'meta',
    consentCategory: 'marketing',
    isInitialized: false,
    init() {
      if (adapter.isInitialized || typeof window === 'undefined') {
        return
      }

      ensureFbqStub()
      injectAsyncScript(
        'https://connect.facebook.net/en_US/fbevents.js',
        'meta-pixel',
      )
      window.fbq('init', pixelId)
      adapter.isInitialized = true
    },
    trackInitiateCheckout(data: InitiateCheckoutEvent) {
      window.fbq?.('track', 'InitiateCheckout', {
        content_name: data.serviceName,
        content_category: data.serviceCategory,
        placement: data.placement,
        destination_url: data.destinationUrl,
        ...data.attribution,
      })
    },
    trackPurchase(data: PurchaseEvent) {
      window.fbq?.('track', 'Purchase', {
        value: data.value,
        currency: data.currency,
        content_category: data.serviceCategory,
        order_id: data.bookingId,
      })
    },
    trackLead(data: LeadEvent) {
      window.fbq?.('track', 'Lead', {
        content_category: data.channel,
        placement: data.placement,
      })
    },
  }

  return adapter
}
