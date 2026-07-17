import type { PricePoint } from '@app-types/types'
import { describe, expect, it } from 'vitest'
import { getLowestPriceInLastDays } from './priceHistory'

describe('getLowestPriceInLastDays', () => {
  it('returns the lowest price within the provided window', () => {
    const history: readonly PricePoint[] = [
      { value: 120, changedAt: '2023-12-10T10:00:00.000Z' },
      { value: 110, changedAt: '2024-01-05T10:00:00.000Z' },
      { value: 90, changedAt: '2024-01-20T10:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(history, 30, new Date('2024-02-01T00:00:00Z')),
    ).toBe(90)
  })

  it('treats entries on the window boundary as part of the range', () => {
    const history: readonly PricePoint[] = [
      { value: 150, changedAt: '2024-01-02T00:00:00.000Z' },
      { value: 200, changedAt: '2024-01-15T00:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(history, 30, new Date('2024-02-01T00:00:00Z')),
    ).toBe(150)
  })

  it('falls back to the last known price if the window is empty', () => {
    const history: readonly PricePoint[] = [
      { value: 120, changedAt: '2023-12-10T10:00:00.000Z' },
      { value: 110, changedAt: '2024-01-05T10:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(history, 5, new Date('2024-02-01T00:00:00Z')),
    ).toBe(110)
  })

  it('considers the price active at the beginning of the window', () => {
    const history: readonly PricePoint[] = [
      { value: 100, changedAt: '2024-01-01T10:00:00.000Z' },
      { value: 120, changedAt: '2024-01-15T10:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(history, 30, new Date('2024-02-01T00:00:00Z')),
    ).toBe(100)
  })

  it('selects a lower transition from within the window', () => {
    const history: readonly PricePoint[] = [
      { value: 100, changedAt: '2024-01-01T10:00:00.000Z' },
      { value: 80, changedAt: '2024-01-15T10:00:00.000Z' },
      { value: 120, changedAt: '2024-01-20T10:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(history, 30, new Date('2024-02-01T00:00:00Z')),
    ).toBe(80)
  })

  it('excludes transitions scheduled after the reference time', () => {
    const history: readonly PricePoint[] = [
      { value: 120, changedAt: '2024-01-01T00:00:00.000Z' },
      { value: 80, changedAt: '2024-03-01T00:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(history, 30, new Date('2024-02-01T00:00:00Z')),
    ).toBe(120)
  })

  it('uses a restoration once the earlier discount leaves the window', () => {
    const history: readonly PricePoint[] = [
      { value: 100, changedAt: '2025-07-01T08:00:00.000Z' },
      { value: 80, changedAt: '2025-09-01T08:00:00.000Z' },
      { value: 100, changedAt: '2025-10-01T08:00:00.000Z' },
    ]

    expect(
      getLowestPriceInLastDays(
        history,
        30,
        new Date('2025-10-01T07:59:59.999Z'),
      ),
    ).toBe(80)
    expect(
      getLowestPriceInLastDays(
        history,
        30,
        new Date('2025-10-01T08:00:00.000Z'),
      ),
    ).toBe(80)
    expect(
      getLowestPriceInLastDays(
        history,
        30,
        new Date('2025-11-01T08:00:00.000Z'),
      ),
    ).toBe(100)
  })

  it('returns undefined for empty or wholly future history', () => {
    expect(getLowestPriceInLastDays([])).toBeUndefined()
    expect(
      getLowestPriceInLastDays(
        [{ value: 100, changedAt: '2030-01-01T00:00:00.000Z' }],
        30,
        new Date('2024-01-01T00:00:00.000Z'),
      ),
    ).toBeUndefined()
  })

  it('does not mutate the input array or its points', () => {
    const history: readonly PricePoint[] = [
      { value: 120, changedAt: '2024-01-20T00:00:00.000Z' },
      { value: 100, changedAt: '2024-01-01T00:00:00.000Z' },
    ]
    const before = structuredClone(history)

    getLowestPriceInLastDays(history, 30, new Date('2024-02-01T00:00:00.000Z'))

    expect(history).toEqual(before)
  })
})
