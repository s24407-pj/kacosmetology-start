import type { PriceHistoryEntry, PricePoint } from '@app-types/types'
import { servicePriceHistory } from '@data/servicePriceHistory'

function ensureHistory(serviceName: string): PriceHistoryEntry {
  let entry = servicePriceHistory.find(
    (item) => item.serviceName === serviceName,
  )

  if (!entry) {
    entry = { serviceName, history: [] }
    servicePriceHistory.push(entry)
  }

  return entry
}

function toIsoString(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString()
  }

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value provided: ${date}`)
  }

  return parsed.toISOString()
}

export function recordPriceChange(
  serviceName: string,
  price: number,
  changedAt: Date | string = new Date(),
): PricePoint {
  const entry = ensureHistory(serviceName)
  const point: PricePoint = {
    value: price,
    changedAt: toIsoString(changedAt),
  }

  entry.history.push(point)
  entry.history.sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
  )

  return point
}

export function getPriceHistory(serviceName: string): PricePoint[] {
  const entry = ensureHistory(serviceName)
  return entry.history.map((point) => ({ ...point }))
}

export function syncCurrentPriceWithHistory(
  serviceName: string,
  currentPrice: number,
  changedAt: Date = new Date(),
): PricePoint | undefined {
  const entry = ensureHistory(serviceName)
  const latestPoint = entry.history[entry.history.length - 1]

  if (!latestPoint || latestPoint.value !== currentPrice) {
    return recordPriceChange(serviceName, currentPrice, changedAt)
  }

  return undefined
}

export function getLowestPriceInLastDays(
  serviceName: string,
  days = 30,
  now: Date = new Date(),
): number | undefined {
  // Consider only price points that are not in the future.
  const relevantHistory = ensureHistory(serviceName).history.filter(
    (p) => new Date(p.changedAt) < now,
  )

  if (!relevantHistory.length) {
    return undefined
  }

  const threshold = new Date(now)
  threshold.setDate(threshold.getDate() - days)

  // Find the latest price point before the 30-day window.
  const lastPointBeforeWindow = [...relevantHistory]
    .filter((point) => new Date(point.changedAt) < threshold)
    .pop()

  // Find all price points within the 30-day window.
  const pointsInWindow = relevantHistory.filter(
    (point) => new Date(point.changedAt) >= threshold,
  )

  const candidates: number[] = []
  if (lastPointBeforeWindow) {
    candidates.push(lastPointBeforeWindow.value)
  } else {
    // If no price history before the window, the price at the start of window
    // must be from the first available price point.
    if (relevantHistory.length > 0) {
      candidates.push(relevantHistory[0].value)
    }
  }

  pointsInWindow.forEach((p) => {
    candidates.push(p.value)
  })

  if (candidates.length === 0) {
    return undefined
  }

  return Math.min(...candidates)
}
