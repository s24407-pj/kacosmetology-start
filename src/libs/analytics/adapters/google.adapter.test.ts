import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGoogleAdapter } from './google.adapter'

describe('createGoogleAdapter', () => {
  beforeEach(() => {
    for (const script of document.querySelectorAll(
      'script[data-analytics-script="google-gtag"]',
    )) {
      script.remove()
    }
    Reflect.deleteProperty(window, 'gtag')
    Reflect.deleteProperty(window, 'dataLayer')
    vi.stubEnv('VITE_GA_ID', 'G-TEST123')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    Reflect.deleteProperty(window, 'gtag')
    Reflect.deleteProperty(window, 'dataLayer')
  })

  it('returns null when measurement id is missing', () => {
    vi.stubEnv('VITE_GA_ID', '')
    expect(createGoogleAdapter()).toBeNull()
  })

  it('bootstraps gtag consent defaults and config once', () => {
    const adapter = createGoogleAdapter()
    expect(adapter).not.toBeNull()
    adapter?.init()
    adapter?.init()

    expect(
      document.querySelectorAll('script[data-analytics-script="google-gtag"]'),
    ).toHaveLength(1)
    expect(window.dataLayer.length).toBeGreaterThan(0)

    const consentDefault = window.dataLayer.find(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === 'consent' &&
        entry[1] === 'default',
    )
    expect(consentDefault).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ])
  })

  it('updates consent mode and tracks facade events', () => {
    const adapter = createGoogleAdapter()
    adapter?.init()
    const gtag = vi.fn()
    window.gtag = gtag

    adapter?.applyConsent?.(true)
    adapter?.applyConsent?.(false)
    adapter?.trackPageView?.({ path: '/galeria', title: 'Galeria' })
    adapter?.trackInitiateCheckout?.({
      placement: 'hero',
      serviceName: 'Makijaż',
      serviceCategory: 'permanent-makeup',
      destinationUrl: 'https://example.com',
      attribution: { gclid: 'abc' },
    })
    adapter?.trackPurchase?.({
      bookingId: 'booking-1',
      value: 250,
      currency: 'PLN',
      serviceCategory: 'permanent-makeup',
    })
    adapter?.trackLead?.({ channel: 'phone', placement: 'footer' })

    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    })
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/galeria',
      page_title: 'Galeria',
    })
    expect(gtag).toHaveBeenCalledWith('event', 'begin_checkout', {
      placement: 'hero',
      item_name: 'Makijaż',
      item_category: 'permanent-makeup',
      destination_url: 'https://example.com',
      gclid: 'abc',
    })
    expect(gtag).toHaveBeenCalledWith('event', 'purchase', {
      transaction_id: 'booking-1',
      value: 250,
      currency: 'PLN',
      item_category: 'permanent-makeup',
    })
    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      channel: 'phone',
      placement: 'footer',
    })
  })

  it('no-ops applyConsent when gtag is unavailable', () => {
    const adapter = createGoogleAdapter()
    Reflect.deleteProperty(window, 'gtag')
    expect(() => adapter?.applyConsent?.(true)).not.toThrow()
  })
})
