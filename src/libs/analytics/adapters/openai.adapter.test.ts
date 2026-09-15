import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createOpenAiAdapter } from './openai.adapter'

describe('createOpenAiAdapter', () => {
  beforeEach(() => {
    for (const script of document.querySelectorAll(
      'script[data-analytics-script="openai-pixel"]',
    )) {
      script.remove()
    }
    Reflect.deleteProperty(window, 'oaiq')
    vi.stubEnv('VITE_OPENAI_PIXEL_ID', 'px-test-123')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    Reflect.deleteProperty(window, 'oaiq')
  })

  it('returns null when pixel id is missing', () => {
    vi.stubEnv('VITE_OPENAI_PIXEL_ID', '')
    expect(createOpenAiAdapter()).toBeNull()
  })

  it('loads official SDK and inits with pixelId object', () => {
    const adapter = createOpenAiAdapter()
    expect(adapter).not.toBeNull()
    adapter?.init()

    const script = document.querySelector(
      'script[data-analytics-script="openai-pixel"]',
    )
    expect(script).toHaveAttribute(
      'src',
      'https://bzrcdn.openai.com/sdk/oaiq.min.js',
    )

    const queued = (window.oaiq as unknown as { q: unknown[][] }).q
    expect(queued).toEqual([['init', { pixelId: 'px-test-123' }]])
  })

  it('maps facade events to official measure names and shapes', () => {
    const adapter = createOpenAiAdapter()
    adapter?.init()
    const oaiq = vi.fn()
    window.oaiq = oaiq

    adapter?.trackInitiateCheckout?.({
      serviceName: 'Makijaż permanentny',
      serviceCategory: 'permanent-makeup',
    })
    adapter?.trackPurchase?.({
      bookingId: 'booking-1',
      value: 250,
      currency: 'PLN',
      serviceCategory: 'permanent-makeup',
    })
    adapter?.trackLead?.({ channel: 'phone', placement: 'footer' })
    adapter?.applyConsent?.({ analytics: false, marketing: false })

    expect(oaiq).toHaveBeenNthCalledWith(1, 'measure', 'checkout_started', {
      type: 'contents',
      contents: [
        {
          id: 'permanent-makeup',
          name: 'Makijaż permanentny',
          content_type: 'product',
        },
      ],
    })
    expect(oaiq).toHaveBeenNthCalledWith(
      2,
      'measure',
      'order_created',
      {
        type: 'contents',
        amount: 25000,
        currency: 'PLN',
        contents: [{ id: 'permanent-makeup', content_type: 'product' }],
      },
      { event_id: 'booking-1' },
    )
    expect(oaiq).toHaveBeenNthCalledWith(3, 'measure', 'lead_created', {
      type: 'customer_action',
    })
    expect(oaiq).toHaveBeenNthCalledWith(4, 'consent', false)
  })
})
