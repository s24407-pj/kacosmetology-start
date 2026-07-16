import { describe, expect, it } from 'vitest'
import { servicePriceHistory } from './servicePriceHistory'
import { services } from './services'

describe('generated service price history identity', () => {
  it('contains exactly one history for every known service ID', () => {
    const catalogIds = services.map((service) => service.id)
    const historyIds = servicePriceHistory.map((entry) => entry.serviceId)

    expect(historyIds).toHaveLength(catalogIds.length)
    expect(new Set(historyIds).size).toBe(historyIds.length)
    expect(new Set(historyIds)).toEqual(new Set(catalogIds))
  })
})
