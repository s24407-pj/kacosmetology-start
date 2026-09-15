import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAnalyticsFacadeForTests } from './index'
import type { AnalyticsAdapter } from './types'

function createMockAdapter(
  overrides: Partial<AnalyticsAdapter> & Pick<AnalyticsAdapter, 'name'>,
): AnalyticsAdapter {
  return {
    isInitialized: false,
    init: vi.fn(function init(this: AnalyticsAdapter) {
      this.isInitialized = true
    }),
    trackPageView: vi.fn(),
    trackInitiateCheckout: vi.fn(),
    trackPurchase: vi.fn(),
    trackLead: vi.fn(),
    ...overrides,
  }
}

describe('analytics facade', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.history.replaceState({}, '', '/?utm_source=ads&gclid=abc')
  })

  it('initializes only cookieless adapters on init', () => {
    const plausible = createMockAdapter({ name: 'plausible' })
    const google = createMockAdapter({
      name: 'google',
      consentCategory: 'analytics',
    })
    const facade = createAnalyticsFacadeForTests([plausible, google])

    facade.init()

    expect(plausible.init).toHaveBeenCalledTimes(1)
    expect(google.init).not.toHaveBeenCalled()
    expect(plausible.isInitialized).toBe(true)
    expect(google.isInitialized).toBe(false)
  })

  it('initializes consent-gated adapters after updateConsent', () => {
    const google = createMockAdapter({
      name: 'google',
      consentCategory: 'analytics',
    })
    const meta = createMockAdapter({
      name: 'meta',
      consentCategory: 'marketing',
    })
    const facade = createAnalyticsFacadeForTests([google, meta])

    facade.init()
    facade.updateConsent({ analytics: true, marketing: false })

    expect(google.init).toHaveBeenCalledTimes(1)
    expect(meta.init).not.toHaveBeenCalled()

    facade.updateConsent({ analytics: true, marketing: true })

    expect(meta.init).toHaveBeenCalledTimes(1)
  })

  it('injects attribution into InitiateCheckout payloads', () => {
    const plausible = createMockAdapter({ name: 'plausible' })
    const facade = createAnalyticsFacadeForTests([plausible])

    facade.init()
    facade.trackInitiateCheckout({
      placement: 'hero',
      destinationUrl: 'https://kacosmetology.booksy.com',
    })

    expect(plausible.trackInitiateCheckout).toHaveBeenCalledWith({
      placement: 'hero',
      destinationUrl: 'https://kacosmetology.booksy.com',
      attribution: expect.objectContaining({
        utm_source: 'ads',
        gclid: 'abc',
      }),
    })
  })

  it('dispatches lead events to initialized adapters only', () => {
    const ready = createMockAdapter({ name: 'ready' })
    const blocked = createMockAdapter({
      name: 'blocked',
      consentCategory: 'marketing',
    })
    const facade = createAnalyticsFacadeForTests([ready, blocked])

    facade.init()
    facade.trackLead({ channel: 'phone', placement: 'footer' })

    expect(ready.trackLead).toHaveBeenCalledWith({
      channel: 'phone',
      placement: 'footer',
    })
    expect(blocked.trackLead).not.toHaveBeenCalled()
  })

  it('swallows adapter errors during tracking', () => {
    const broken = createMockAdapter({
      name: 'broken',
      trackPageView: vi.fn(() => {
        throw new Error('boom')
      }),
    })
    const facade = createAnalyticsFacadeForTests([broken])

    facade.init()
    expect(() => facade.trackPageView({ path: '/' })).not.toThrow()
  })
})
