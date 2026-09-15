import { brand } from '@data/business'
import type {
  AnalyticsAdapter,
  InitiateCheckoutEvent,
  LeadEvent,
  PageViewEvent,
  PurchaseEvent,
} from '../types'

const PLAUSIBLE_HOST = 'https://analytics.mflisik.ovh'
const PLAUSIBLE_SCRIPT_SRC = `${PLAUSIBLE_HOST}/js/script.manual.js`

function toProps(
  data: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const entries = Object.entries(data).filter(
    ([, value]) => value !== undefined && value !== '',
  )
  if (entries.length === 0) {
    return undefined
  }
  return Object.fromEntries(entries)
}

export function createPlausibleAdapter(): AnalyticsAdapter | null {
  const domain = new URL(brand.siteUrl).hostname
  if (!domain) {
    return null
  }

  const adapter: AnalyticsAdapter = {
    name: 'plausible',
    isInitialized: false,
    init() {
      if (adapter.isInitialized || typeof window === 'undefined') {
        return
      }

      if (typeof window.plausible !== 'function') {
        const plausibleStub = function plausible(
          _eventName: string,
          _options?: { props?: Record<string, unknown> },
        ) {
          const stub = plausibleStub as typeof plausibleStub & {
            q?: IArguments[]
          }
          stub.q = stub.q || []
          // Plausible CDN drains `.q` as an Arguments list.
          // biome-ignore lint/complexity/noArguments: required by Plausible queue protocol
          stub.q.push(arguments)
        }
        window.plausible = plausibleStub
      }

      if (
        !document.querySelector('script[data-analytics-script="plausible"]')
      ) {
        const script = document.createElement('script')
        script.async = true
        script.defer = true
        script.src = PLAUSIBLE_SCRIPT_SRC
        script.dataset.domain = domain
        script.dataset.api = `${PLAUSIBLE_HOST}/api/event`
        script.dataset.analyticsScript = 'plausible'
        document.head.appendChild(script)
      }

      adapter.isInitialized = true
    },
    trackPageView(data: PageViewEvent) {
      window.plausible?.('pageview', {
        props: toProps({ path: data.path, title: data.title }),
      })
    },
    trackInitiateCheckout(data: InitiateCheckoutEvent) {
      window.plausible?.('InitiateCheckout', {
        props: toProps({
          placement: data.placement,
          serviceName: data.serviceName,
          serviceCategory: data.serviceCategory,
          destinationUrl: data.destinationUrl,
          ...data.attribution,
        }),
      })
    },
    trackPurchase(data: PurchaseEvent) {
      window.plausible?.('Purchase', {
        props: toProps({
          bookingId: data.bookingId,
          value: data.value,
          currency: data.currency,
          serviceCategory: data.serviceCategory,
        }),
      })
    },
    trackLead(data: LeadEvent) {
      window.plausible?.('Lead', {
        props: toProps({
          channel: data.channel,
          placement: data.placement,
        }),
      })
    },
  }

  return adapter
}
