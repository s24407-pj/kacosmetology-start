import { services } from '@data/services'
import { describe, expect, it } from 'vitest'
import { getServicePricing } from './servicePricing'

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
