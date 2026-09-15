import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMetaAdapter } from './meta.adapter'

describe('createMetaAdapter', () => {
  beforeEach(() => {
    for (const script of document.querySelectorAll(
      'script[data-analytics-script="meta-pixel"]',
    )) {
      script.remove()
    }
    Reflect.deleteProperty(window, 'fbq')
    vi.stubEnv('VITE_META_PIXEL_ID', 'meta-123')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    Reflect.deleteProperty(window, 'fbq')
  })

  it('returns null when pixel id is missing', () => {
    vi.stubEnv('VITE_META_PIXEL_ID', '')
    expect(createMetaAdapter()).toBeNull()
  })

  it('installs the fbq stub, script, and init once', () => {
    const adapter = createMetaAdapter()
    expect(adapter).not.toBeNull()
    adapter?.init()
    adapter?.init()

    expect(typeof window.fbq).toBe('function')
    expect(
      document.querySelectorAll('script[data-analytics-script="meta-pixel"]'),
    ).toHaveLength(1)

    const stub = window.fbq as typeof window.fbq & { queue: unknown[] }
    expect(stub.queue).toEqual([['init', 'meta-123']])
  })

  it('reuses an existing window.fbq without replacing it', () => {
    const existing = vi.fn() as typeof window.fbq
    window.fbq = existing

    const adapter = createMetaAdapter()
    adapter?.init()

    expect(window.fbq).toBe(existing)
    expect(existing).toHaveBeenCalledWith('init', 'meta-123')
  })

  it('routes events through callMethod when present', () => {
    const adapter = createMetaAdapter()
    adapter?.init()

    const callMethod = vi.fn()
    const stub = window.fbq as typeof window.fbq & {
      callMethod?: (...args: unknown[]) => void
      queue: unknown[]
    }
    stub.callMethod = callMethod
    stub.queue = []

    adapter?.trackInitiateCheckout?.({
      placement: 'cta',
      serviceName: 'Makijaż',
      serviceCategory: 'permanent-makeup',
      destinationUrl: 'https://example.com',
      attribution: { fbclid: 'f1' },
    })
    adapter?.trackPurchase?.({
      bookingId: 'b-1',
      value: 180,
      currency: 'PLN',
      serviceCategory: 'permanent-makeup',
    })
    adapter?.trackLead?.({ channel: 'booksy', placement: 'banner' })

    expect(callMethod).toHaveBeenCalledWith('track', 'InitiateCheckout', {
      content_name: 'Makijaż',
      content_category: 'permanent-makeup',
      placement: 'cta',
      destination_url: 'https://example.com',
      fbclid: 'f1',
    })
    expect(callMethod).toHaveBeenCalledWith('track', 'Purchase', {
      value: 180,
      currency: 'PLN',
      content_category: 'permanent-makeup',
      order_id: 'b-1',
    })
    expect(callMethod).toHaveBeenCalledWith('track', 'Lead', {
      content_category: 'booksy',
      placement: 'banner',
    })
  })
})
