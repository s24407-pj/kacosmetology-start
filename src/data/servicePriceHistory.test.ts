import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLowestPriceInLastDays } from '../libs/priceHistory'
import { getServicePriceHistory } from './servicePriceHistory'
import { services } from './services'

const HYDROGEN_ID = 'service-oczyszczanie-wodorowe'
const CONSULTATION_ID =
  'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'

describe('service price transition ledger', () => {
  it('contains exactly one literal history for every known service ID', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/data/servicePriceHistory.ts'),
      'utf8',
    )
    const ledgerIds = [...source.matchAll(/serviceId: '(service-[^']+)'/g)].map(
      ([, serviceId]) => serviceId,
    )
    const catalogIds = services.map((service) => service.id)

    expect(ledgerIds).toHaveLength(catalogIds.length)
    expect(new Set(ledgerIds).size).toBe(ledgerIds.length)
    expect(ledgerIds).toEqual(catalogIds)
    expect(source).not.toContain("from '@data/promotion'")
    expect(source).not.toContain("from '@data/services'")
  })

  it('stores valid, strictly ordered effective-price transitions', () => {
    for (const service of services) {
      const history = getServicePriceHistory(service.id)

      expect(history.length).toBeGreaterThan(0)
      for (const [index, point] of history.entries()) {
        expect(point.value).toBeGreaterThan(0)
        expect(Number.isInteger(point.value)).toBe(true)
        expect(new Date(point.changedAt).toISOString()).toBe(point.changedAt)

        const previous = history[index - 1]
        if (previous) {
          expect(new Date(point.changedAt).getTime()).toBeGreaterThan(
            new Date(previous.changedAt).getTime(),
          )
          expect(point.value).not.toBe(previous.value)
        }
      }
    }
  })

  it('returns defensive point copies and no history for an unknown ID', () => {
    const firstRead = getServicePriceHistory(HYDROGEN_ID)
    const secondRead = getServicePriceHistory(HYDROGEN_ID)

    expect(firstRead).toEqual(secondRead)
    expect(firstRead).not.toBe(secondRead)
    expect(firstRead[0]).not.toBe(secondRead[0])

    firstRead[0]!.value = 1
    firstRead.push({ value: 1, changedAt: '2025-01-01T00:00:00.000Z' })

    expect(getServicePriceHistory(HYDROGEN_ID)).toEqual(secondRead)
    expect(getServicePriceHistory('service-unknown-service')).toEqual([])
  })

  it('records the contiguous hydrogen promotion and its restoration', () => {
    expect(getServicePriceHistory(HYDROGEN_ID)).toEqual([
      { value: 250, changedAt: '2025-07-01T08:00:00.000Z' },
      { value: 200, changedAt: '2025-09-01T08:00:00.000Z' },
      { value: 250, changedAt: '2025-11-01T08:00:00.000Z' },
    ])
  })

  it('records all reviewed consultation changes and the final restoration', () => {
    expect(getServicePriceHistory(CONSULTATION_ID)).toEqual([
      { value: 350, changedAt: '2025-07-01T08:00:00.000Z' },
      { value: 280, changedAt: '2025-09-01T08:00:00.000Z' },
      { value: 350, changedAt: '2025-10-01T08:00:00.000Z' },
      { value: 250, changedAt: '2025-11-01T08:00:00.000Z' },
      { value: 300, changedAt: '2026-01-01T08:00:00.000Z' },
      { value: 350, changedAt: '2027-01-01T08:00:00.000Z' },
    ])
  })

  it('preserves the disclosed October 2025 hydrogen treatment price', () => {
    expect(
      getLowestPriceInLastDays(
        getServicePriceHistory(HYDROGEN_ID),
        30,
        new Date('2025-10-01T00:00:00.000Z'),
      ),
    ).toBe(200)
  })

  it('preserves the disclosed price at a 2026 consultation boundary', () => {
    expect(
      getLowestPriceInLastDays(
        getServicePriceHistory(CONSULTATION_ID),
        30,
        new Date('2026-02-01T00:00:00.000Z'),
      ),
    ).toBe(300)
  })
})
