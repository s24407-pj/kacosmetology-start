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
      {
        id: 'service-1',
        name: 'S1',
        slug: 's1',
        area: 'cosmetology',
        category: 'cosmetology',
        price: 15,
        duration: 30,
        shortDescription: 'Desc',
        isPublished: false,
        hasDetailPage: false,
      },
      {
        id: 'service-2',
        name: 'S2',
        slug: 's2',
        area: 'cosmetology',
        category: 'cosmetology',
        price: 60,
        duration: 45,
        shortDescription: 'Desc',
        isPublished: true,
        hasDetailPage: true,
      },
      {
        id: 'service-3',
        name: 'S3',
        slug: 's3',
        area: 'trichology',
        category: 'trichology',
        price: 220,
        duration: 60,
        shortDescription: 'Desc',
        isPublished: true,
        hasDetailPage: true,
      },
      {
        id: 'service-4',
        name: 'S4',
        slug: 's4',
        area: 'cosmetology',
        category: 'cosmetology',
        price: 900,
        duration: 90,
        shortDescription: 'Desc',
        isPublished: false,
        hasDetailPage: false,
      },
    ] as const

    expect(derivePublishedServicePriceRange(sample as never)).toBe('60-220 PLN')
  })

  it('formats a single price when min equals max', () => {
    const single = [
      {
        id: 'service-1',
        name: 'S1',
        slug: 's1',
        area: 'cosmetology',
        category: 'cosmetology',
        price: 150,
        duration: 60,
        shortDescription: 'Desc',
        isPublished: true,
        hasDetailPage: true,
      },
    ] as const

    expect(derivePublishedServicePriceRange(single as never)).toBe('150 PLN')
  })

  it('defensively handles empty service collections', () => {
    expect(derivePublishedServicePriceRange([])).toBe('')
  })
})
