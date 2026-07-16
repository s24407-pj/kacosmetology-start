import { describe, expect, it } from 'vitest'
import { getLowestPriceInLastDays } from '../libs/priceHistory'
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

  it('preserves the disclosed October 2025 hydrogen treatment price', () => {
    const before = structuredClone(servicePriceHistory)

    expect(
      getLowestPriceInLastDays(
        'service-oczyszczanie-wodorowe',
        30,
        new Date('2025-10-01T00:00:00.000Z'),
      ),
    ).toBe(200)
    expect(servicePriceHistory).toEqual(before)
  })

  it('preserves the disclosed price at a 2026 consultation boundary', () => {
    expect(
      getLowestPriceInLastDays(
        'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem',
        30,
        new Date('2026-02-01T00:00:00.000Z'),
      ),
    ).toBe(300)
  })
})
