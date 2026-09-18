import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGoogleAdapter, EEA_AND_UK_REGIONS } from './google.adapter'

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

  it('bootstraps gtag with denied consent defaults scoped to EEA/UK', () => {
    const adapter = createGoogleAdapter()
    expect(adapter).not.toBeNull()
    expect(adapter?.consentCategories).toEqual(['analytics', 'marketing'])
    adapter?.init()
    adapter?.init()

    expect(
      document.querySelectorAll('script[data-analytics-script="google-gtag"]'),
    ).toHaveLength(1)
    expect(window.dataLayer.length).toBeGreaterThan(0)

    const consentDefault = window.dataLayer.find((entry) => {
      if (!entry || typeof entry !== 'object') {
        return false
      }
      const command = entry as ArrayLike<unknown>
      return command[0] === 'consent' && command[1] === 'default'
    })
    expect(consentDefault).toBeTruthy()
    expect(Object.prototype.toString.call(consentDefault)).toBe(
      '[object Arguments]',
    )
    expect(Array.from(consentDefault as ArrayLike<unknown>)).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        region: EEA_AND_UK_REGIONS,
      },
    ])
  })

  it('orders consent update before config and emits initial page_view with deduplication', () => {
    const adapter = createGoogleAdapter()
    adapter?.init()
    adapter?.applyConsent?.({ analytics: true, marketing: true })

    const entries = window.dataLayer.map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    )

    const updateIndex = entries.findIndex(
      (entry) => entry[0] === 'consent' && entry[1] === 'update',
    )
    const configIndex = entries.findIndex(
      (entry) => entry[0] === 'config' && entry[1] === 'G-TEST123',
    )
    const pageViewIndex = entries.findIndex(
      (entry) => entry[0] === 'event' && entry[1] === 'page_view',
    )

    expect(updateIndex).toBeGreaterThan(-1)
    expect(configIndex).toBeGreaterThan(-1)
    expect(pageViewIndex).toBeGreaterThan(-1)

    // Consent update MUST happen before config so container starts in granted state.
    expect(updateIndex).toBeLessThan(configIndex)
    expect(configIndex).toBeLessThan(pageViewIndex)

    expect(entries[pageViewIndex]).toEqual([
      'event',
      'page_view',
      { page_path: '/', page_title: undefined },
    ])

    // Redundant trackPageView on same path does not duplicate
    adapter?.trackPageView?.({ path: '/' })
    const pageViewCount = entries.filter(
      (entry) => entry[0] === 'event' && entry[1] === 'page_view',
    ).length
    expect(pageViewCount).toBe(1)

    // Navigation tracks new path
    adapter?.trackPageView?.({ path: '/galeria', title: 'Galeria' })
    const lastEntry = Array.from(
      window.dataLayer[window.dataLayer.length - 1] as ArrayLike<unknown>,
    )
    expect(lastEntry).toEqual([
      'event',
      'page_view',
      { page_path: '/galeria', page_title: 'Galeria' },
    ])
  })

  it('maps analytics and marketing grants to Consent Mode signals', () => {
    const adapter = createGoogleAdapter()
    adapter?.init()
    const gtag = vi.fn()
    window.gtag = gtag

    adapter?.applyConsent?.({ analytics: true, marketing: false })
    adapter?.applyConsent?.({ analytics: false, marketing: true })
    adapter?.applyConsent?.({ analytics: true, marketing: true })
    adapter?.applyConsent?.({ analytics: false, marketing: false })

    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })

  it('tracks facade events', () => {
    const adapter = createGoogleAdapter()
    adapter?.init()
    const gtag = vi.fn()
    window.gtag = gtag

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
    expect(() =>
      adapter?.applyConsent?.({ analytics: true, marketing: false }),
    ).not.toThrow()
  })
})
