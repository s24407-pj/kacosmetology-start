import { services } from '@data/services'
import { describe, expect, it } from 'vitest'
import {
  derivePublishedServicePriceRange,
  getServicePricing,
} from './servicePricing'

describe('getServicePricing', () => {
  it('uses the standard price outside a promotion', () => {
    const service = services[0]
    expect(
      getServicePricing(service, new Date('2026-07-18T12:00:00Z')),
    ).toEqual({
      standardPrice: service.price,
      currentPrice: service.price,
      activePromotion: null,
      lowestPriceInLast30Days: undefined,
    })
  })

  it('uses the shared promotion and Omnibus history policies', () => {
    const pricing = getServicePricing(
      services[0],
      new Date('2025-09-15T12:00:00Z'),
    )
    expect(pricing.currentPrice).toBeLessThan(pricing.standardPrice)
    expect(pricing.activePromotion).not.toBeNull()
    expect(pricing.lowestPriceInLast30Days).toBeDefined()
  })
})

describe('derivePublishedServicePriceRange', () => {
  it('derives the Schema.org price range from all published services', () => {
    expect(derivePublishedServicePriceRange()).toBe('30-550 PLN')
  })

  it('determines the minimum and maximum price and ignores unpublished services', () => {
    const sample = [
      { price: 15, isPublished: false },
      { price: 60, isPublished: true },
      { price: 220, isPublished: true },
      { price: 900, isPublished: false },
    ]

    expect(derivePublishedServicePriceRange(sample)).toBe('60-220 PLN')
  })

  it('formats a single price when min equals max', () => {
    const single = [{ price: 150, isPublished: true }]

    expect(derivePublishedServicePriceRange(single)).toBe('150 PLN')
  })

  it('defensively handles empty service collections', () => {
    expect(derivePublishedServicePriceRange([])).toBeUndefined()
  })
})
