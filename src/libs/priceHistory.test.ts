import type { ServiceId } from '@app-types/types'
import { resetServicePriceHistory } from '@data/servicePriceHistory'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getLowestPriceInLastDays,
  getPriceHistory,
  recordPriceChange,
  syncCurrentPriceWithHistory,
} from './priceHistory'

const SERVICE_ID: ServiceId = 'service-test-service'

describe('price history helpers', () => {
  beforeEach(() => {
    resetServicePriceHistory()
  })

  it('records price changes in chronological order', () => {
    recordPriceChange(SERVICE_ID, 100, new Date('2024-01-10T10:00:00Z'))
    recordPriceChange(SERVICE_ID, 90, new Date('2024-01-02T10:00:00Z'))

    expect(getPriceHistory(SERVICE_ID)).toEqual([
      { value: 90, changedAt: '2024-01-02T10:00:00.000Z' },
      { value: 100, changedAt: '2024-01-10T10:00:00.000Z' },
    ])
  })

  it('normalises string date values into ISO strings', () => {
    recordPriceChange(SERVICE_ID, 150, '2024-03-01T08:30:00+01:00')

    expect(getPriceHistory(SERVICE_ID)).toEqual([
      { value: 150, changedAt: '2024-03-01T07:30:00.000Z' },
    ])
  })

  it('returns a defensive copy of the history list', () => {
    recordPriceChange(SERVICE_ID, 95, new Date('2024-04-01T09:00:00Z'))

    const history = getPriceHistory(SERVICE_ID)
    history.push({ value: 10, changedAt: '2023-01-01T00:00:00.000Z' })

    expect(getPriceHistory(SERVICE_ID)).toEqual([
      { value: 95, changedAt: '2024-04-01T09:00:00.000Z' },
    ])
  })

  it('returns the lowest price within the provided window', () => {
    recordPriceChange(SERVICE_ID, 120, new Date('2023-12-10T10:00:00Z'))
    recordPriceChange(SERVICE_ID, 110, new Date('2024-01-05T10:00:00Z'))
    recordPriceChange(SERVICE_ID, 90, new Date('2024-01-20T10:00:00Z'))

    expect(
      getLowestPriceInLastDays(
        SERVICE_ID,
        30,
        new Date('2024-02-01T00:00:00Z'),
      ),
    ).toBe(90)
  })

  it('treats entries on the window boundary as part of the range', () => {
    const now = new Date('2024-02-01T00:00:00Z')
    const threshold = new Date(now)
    threshold.setDate(threshold.getDate() - 30)

    recordPriceChange(SERVICE_ID, 150, threshold)
    recordPriceChange(SERVICE_ID, 200, new Date('2024-01-15T00:00:00Z'))

    expect(getLowestPriceInLastDays(SERVICE_ID, 30, now)).toBe(150)
  })

  it('falls back to the last known price if the window is empty', () => {
    recordPriceChange(SERVICE_ID, 120, new Date('2023-12-10T10:00:00Z'))
    recordPriceChange(SERVICE_ID, 110, new Date('2024-01-05T10:00:00Z'))

    // Window is 2024-01-27 to 2024-02-01, last price before is 110
    expect(
      getLowestPriceInLastDays(SERVICE_ID, 5, new Date('2024-02-01T00:00:00Z')),
    ).toBe(110)
  })

  it('considers the price active at the beginning of the window', () => {
    recordPriceChange(SERVICE_ID, 100, new Date('2024-01-01T10:00:00Z')) // Price before window
    recordPriceChange(SERVICE_ID, 120, new Date('2024-01-15T10:00:00Z')) // Price inside window

    // Window is 2024-01-02 to 2024-02-01
    expect(
      getLowestPriceInLastDays(
        SERVICE_ID,
        30,
        new Date('2024-02-01T00:00:00Z'),
      ),
    ).toBe(100)
  })

  it('selects the lowest price from within the window if it is lower', () => {
    recordPriceChange(SERVICE_ID, 100, new Date('2024-01-01T10:00:00Z')) // Price before window
    recordPriceChange(SERVICE_ID, 80, new Date('2024-01-15T10:00:00Z')) // Price inside window
    recordPriceChange(SERVICE_ID, 120, new Date('2024-01-20T10:00:00Z')) // Price inside window

    // Window is 2024-01-02 to 2024-02-01
    expect(
      getLowestPriceInLastDays(
        SERVICE_ID,
        30,
        new Date('2024-02-01T00:00:00Z'),
      ),
    ).toBe(80)
  })

  it('excludes price points scheduled after the reference time', () => {
    recordPriceChange(SERVICE_ID, 120, new Date('2024-01-01T00:00:00Z'))
    recordPriceChange(SERVICE_ID, 80, new Date('2024-03-01T00:00:00Z'))

    expect(
      getLowestPriceInLastDays(
        SERVICE_ID,
        30,
        new Date('2024-02-01T00:00:00Z'),
      ),
    ).toBe(120)
  })

  it('returns undefined for services without history', () => {
    expect(getLowestPriceInLastDays('service-unknown-service')).toBeUndefined()
    expect(getPriceHistory('service-unknown-service')).toEqual([])
  })

  it('synchronises the current price without duplicating entries', () => {
    const firstSync = syncCurrentPriceWithHistory(
      SERVICE_ID,
      130,
      new Date('2024-05-01T00:00:00Z'),
    )

    expect(firstSync).toEqual({
      value: 130,
      changedAt: '2024-05-01T00:00:00.000Z',
    })
    expect(getPriceHistory(SERVICE_ID)).toEqual([
      { value: 130, changedAt: '2024-05-01T00:00:00.000Z' },
    ])

    const secondSync = syncCurrentPriceWithHistory(
      SERVICE_ID,
      130,
      new Date('2024-05-02T00:00:00Z'),
    )

    expect(secondSync).toBeUndefined()
    expect(getPriceHistory(SERVICE_ID)).toEqual([
      { value: 130, changedAt: '2024-05-01T00:00:00.000Z' },
    ])

    const thirdSync = syncCurrentPriceWithHistory(
      SERVICE_ID,
      125,
      new Date('2024-05-03T00:00:00Z'),
    )

    expect(thirdSync).toEqual({
      value: 125,
      changedAt: '2024-05-03T00:00:00.000Z',
    })
    expect(getPriceHistory(SERVICE_ID)).toEqual([
      { value: 130, changedAt: '2024-05-01T00:00:00.000Z' },
      { value: 125, changedAt: '2024-05-03T00:00:00.000Z' },
    ])
  })
})
