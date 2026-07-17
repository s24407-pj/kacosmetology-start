import type { PricePoint } from '@app-types/types'

export function getLowestPriceInLastDays(
  history: readonly Readonly<PricePoint>[],
  days = 30,
  now: Date = new Date(),
): number | undefined {
  const nowTimestamp = now.getTime()
  const threshold = new Date(now)
  threshold.setDate(threshold.getDate() - days)
  const thresholdTimestamp = threshold.getTime()

  let activeAtWindowStart:
    | { readonly timestamp: number; readonly value: number }
    | undefined
  const candidates: number[] = []

  for (const point of history) {
    const timestamp = new Date(point.changedAt).getTime()

    if (Number.isNaN(timestamp) || timestamp > nowTimestamp) {
      continue
    }

    if (
      timestamp <= thresholdTimestamp &&
      (!activeAtWindowStart || timestamp > activeAtWindowStart.timestamp)
    ) {
      activeAtWindowStart = { timestamp, value: point.value }
    }

    if (timestamp >= thresholdTimestamp) {
      candidates.push(point.value)
    }
  }

  if (activeAtWindowStart) {
    candidates.push(activeAtWindowStart.value)
  }

  return candidates.length > 0 ? Math.min(...candidates) : undefined
}
