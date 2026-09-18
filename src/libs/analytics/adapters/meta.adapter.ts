import { injectAsyncScript } from '../script'
import type {
  AnalyticsAdapter,
  ConsentSettings,
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
  queue: IArguments[]
  loaded: boolean
  version: string
  push: Window['fbq']
}

function ensureFbqStub() {
  if (typeof window.fbq === 'function') {
    // fbevents.js warns CONFLICTING_VERSIONS when window.fbq !== window._fbq.
    if (!window._fbq) {
      window._fbq = window.fbq
    }
    return
  }

  // Official fbevents stub queues Arguments; plain rest arrays can break drain.
  const fbq = function fbq(..._args: unknown[]) {
    const stub = fbq as FbqStub
    if (stub.callMethod) {
      // biome-ignore lint/complexity/noArguments: required by Meta Pixel queue protocol
      stub.callMethod.apply(stub, arguments as unknown as unknown[])
    } else {
      // biome-ignore lint/complexity/noArguments: required by Meta Pixel queue protocol
      stub.queue.push(arguments)
    }
  } as FbqStub

  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.push = fbq
  window.fbq = fbq
  // Official base code: if (!f._fbq) f._fbq = n
  window._fbq = fbq
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
      // Official Meta base code fires PageView on install; SPA route changes
      // rely on Meta's default History API listener (disablePushState not set).
      window.fbq('track', 'PageView')
      adapter.isInitialized = true
    },
    applyConsent(settings: ConsentSettings) {
      if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
        return
      }

      window.fbq('consent', settings.marketing ? 'grant' : 'revoke')
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
