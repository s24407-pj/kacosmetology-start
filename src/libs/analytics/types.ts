export interface AttributionContext {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  fbclid?: string
  referrer?: string
}

export type PageViewEvent = {
  path: string
  title?: string
}

export type InitiateCheckoutEvent = {
  placement?: string
  serviceName?: string
  serviceCategory?: string
  destinationUrl?: string
  attribution?: AttributionContext
}

export type PurchaseEvent = {
  bookingId: string
  value: number
  currency: 'PLN'
  serviceCategory?: string
}

export type LeadEvent = {
  channel: string
  placement?: string
}

export type ConsentCategory = 'analytics' | 'marketing'

export type ConsentSettings = {
  analytics: boolean
  marketing: boolean
}

export interface AnalyticsAdapter {
  readonly name: string
  /** Single required category. Ignored when `consentCategories` is set. */
  readonly consentCategory?: ConsentCategory
  /**
   * Dual-purpose vendors (e.g. Google Analytics + Ads under one gtag).
   * Adapter may init / receive events when any listed category is granted.
   */
  readonly consentCategories?: ConsentCategory[]
  isInitialized: boolean
  init: () => void
  /** Sync vendor consent mode after grant/revoke without re-init. */
  applyConsent?: (settings: ConsentSettings) => void
  trackPageView?: (data: PageViewEvent) => void
  trackInitiateCheckout?: (data: InitiateCheckoutEvent) => void
  trackPurchase?: (data: PurchaseEvent) => void
  trackLead?: (data: LeadEvent) => void
}
