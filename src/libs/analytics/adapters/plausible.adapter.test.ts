import '@testing-library/jest-dom/vitest'
import { brand } from '@data/business'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlausibleAdapter } from './plausible.adapter'

describe('createPlausibleAdapter', () => {
  beforeEach(() => {
    for (const script of document.querySelectorAll(
      'script[data-analytics-script="plausible"]',
    )) {
      script.remove()
    }
    Reflect.deleteProperty(window, 'plausible')
  })

  afterEach(() => {
    Reflect.deleteProperty(window, 'plausible')
  })

  it('creates an adapter for the brand site hostname', () => {
    const adapter = createPlausibleAdapter()
    expect(adapter).not.toBeNull()
    expect(adapter?.name).toBe('plausible')
    expect(adapter?.consentCategory).toBeUndefined()
  })

  it('injects the Plausible stub and script once', () => {
    const adapter = createPlausibleAdapter()
    adapter?.init()
    adapter?.init()

    expect(typeof window.plausible).toBe('function')
    expect(
      document.querySelectorAll('script[data-analytics-script="plausible"]'),
    ).toHaveLength(1)

    const script = document.querySelector(
      'script[data-analytics-script="plausible"]',
    )
    expect(script).toHaveAttribute(
      'src',
      'https://analytics.mflisik.ovh/js/script.manual.js',
    )
    expect(script).toHaveAttribute(
      'data-domain',
      new URL(brand.siteUrl).hostname,
    )
    expect(script).toHaveAttribute(
      'data-api',
      'https://analytics.mflisik.ovh/api/event',
    )
  })

  it('reuses an existing window.plausible without replacing it', () => {
    const existing = vi.fn()
    window.plausible = existing

    const adapter = createPlausibleAdapter()
    adapter?.init()

    expect(window.plausible).toBe(existing)
  })

  it('skips script injection when the tag already exists', () => {
    const existing = document.createElement('script')
    existing.dataset.analyticsScript = 'plausible'
    document.head.appendChild(existing)

    const adapter = createPlausibleAdapter()
    adapter?.init()

    expect(
      document.querySelectorAll('script[data-analytics-script="plausible"]'),
    ).toHaveLength(1)
  })

  it('queues events through the stub until the real script loads', () => {
    const adapter = createPlausibleAdapter()
    adapter?.init()

    adapter?.trackPageView?.({ path: '/oferta', title: 'Oferta' })
    adapter?.trackInitiateCheckout?.({
      placement: 'hero',
      serviceName: 'Makijaż',
      serviceCategory: 'permanent-makeup',
      destinationUrl: 'https://example.com',
      attribution: { utm_source: 'ads' },
    })
    adapter?.trackPurchase?.({
      bookingId: 'b-1',
      value: 200,
      currency: 'PLN',
      serviceCategory: 'permanent-makeup',
    })
    adapter?.trackLead?.({ channel: 'phone', placement: 'footer' })

    const stub = window.plausible as typeof window.plausible & {
      q?: IArguments[]
    }
    expect(stub.q).toHaveLength(4)
    expect(stub.q?.[0]?.[0]).toBe('pageview')
    expect(stub.q?.[1]?.[0]).toBe('InitiateCheckout')
    expect(stub.q?.[2]?.[0]).toBe('Purchase')
    expect(stub.q?.[3]?.[0]).toBe('Lead')
  })

  it('omits empty props from Plausible payloads', () => {
    const plausible = vi.fn()
    window.plausible = plausible

    const adapter = createPlausibleAdapter()
    adapter?.init()
    adapter?.trackPageView?.({ path: '' })
    adapter?.trackLead?.({ channel: 'phone' })

    expect(plausible).toHaveBeenNthCalledWith(1, 'pageview', {
      props: undefined,
    })
    expect(plausible).toHaveBeenNthCalledWith(2, 'Lead', {
      props: { channel: 'phone' },
    })
  })
})
