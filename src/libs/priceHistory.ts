import type {
  PriceHistoryEntry,
  PricePoint,
  ServiceId,
} from '@app-types/types'
import { servicePriceHistory } from '@data/servicePriceHistory'

function ensureHistory(serviceId: ServiceId): PriceHistoryEntry {
  let entry = servicePriceHistory.find((item) => item.serviceId === serviceId)

  if (!entry) {
    entry = { serviceId, history: [] }
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
  serviceId: ServiceId,
  price: number,
  changedAt: Date | string = new Date(),
): PricePoint {
  const entry = ensureHistory(serviceId)
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

export function getPriceHistory(serviceId: ServiceId): PricePoint[] {
  const entry = ensureHistory(serviceId)
  return entry.history.map((point) => ({ ...point }))
}

export function syncCurrentPriceWithHistory(
  serviceId: ServiceId,
  currentPrice: number,
  changedAt: Date = new Date(),
): PricePoint | undefined {
  const entry = ensureHistory(serviceId)
  const latestPoint = entry.history[entry.history.length - 1]

  if (!latestPoint || latestPoint.value !== currentPrice) {
    return recordPriceChange(serviceId, currentPrice, changedAt)
  }

  return undefined
}

export function getLowestPriceInLastDays(
  serviceId: ServiceId,
  days = 30,
  now: Date = new Date(),
): number | undefined {
  // Consider only price points that are not in the future.
  const relevantHistory = ensureHistory(serviceId).history.filter(
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
