import { injectAsyncScript } from '../script'
import type {
  AnalyticsAdapter,
  ConsentSettings,
  InitiateCheckoutEvent,
  LeadEvent,
  PurchaseEvent,
} from '../types'

const OPENAI_PIXEL_SCRIPT_SRC = 'https://bzrcdn.openai.com/sdk/oaiq.min.js'

function getOpenAiPixelId(): string | undefined {
  const id = import.meta.env.VITE_OPENAI_PIXEL_ID
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

/** Major-unit value → ISO 4217 minor-unit integer for OpenAI measure payloads. */
function toMinorUnits(value: number): number {
  return Math.round(value * 100)
}

type OaiqStub = ((...args: unknown[]) => void) & {
  q: IArguments[]
}

function ensureOaiqStub() {
  if (typeof window.oaiq === 'function') {
    return
  }

  // Official snippet queues Arguments onto oaiq.q — not plain rest arrays.
  // https://developers.openai.com/ads/measurement-pixel
  const oaiq = function oaiq(..._args: unknown[]) {
    // biome-ignore lint/complexity/noArguments: required by OpenAI Pixel queue protocol
    ;(oaiq as OaiqStub).q.push(arguments)
  } as OaiqStub

  oaiq.q = []
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
      injectAsyncScript(OPENAI_PIXEL_SCRIPT_SRC, 'openai-pixel')
      window.oaiq('init', { pixelId })
      adapter.isInitialized = true
    },
    applyConsent(settings: ConsentSettings) {
      if (typeof window === 'undefined' || typeof window.oaiq !== 'function') {
        return
      }

      window.oaiq('consent', settings.marketing)
    },
    trackInitiateCheckout(data: InitiateCheckoutEvent) {
      const contents =
        data.serviceName || data.serviceCategory
          ? [
              {
                ...(data.serviceCategory ? { id: data.serviceCategory } : {}),
                ...(data.serviceName ? { name: data.serviceName } : {}),
                content_type: 'product',
              },
            ]
          : undefined

      window.oaiq?.('measure', 'checkout_started', {
        type: 'contents',
        ...(contents ? { contents } : {}),
      })
    },
    trackPurchase(data: PurchaseEvent) {
      const contents = data.serviceCategory
        ? [
            {
              id: data.serviceCategory,
              content_type: 'product',
            },
          ]
        : undefined

      window.oaiq?.(
        'measure',
        'order_created',
        {
          type: 'contents',
          amount: toMinorUnits(data.value),
          currency: data.currency,
          ...(contents ? { contents } : {}),
        },
        { event_id: data.bookingId },
      )
    },
    trackLead(_data: LeadEvent) {
      window.oaiq?.('measure', 'lead_created', {
        type: 'customer_action',
      })
    },
  }

  return adapter
}
