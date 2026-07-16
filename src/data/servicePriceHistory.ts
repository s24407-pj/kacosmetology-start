import type { PriceHistoryEntry, PricePoint, Service } from '@app-types/types'
import { doesPromotionApplyToService, promotionConfigs } from '@data/promotion'
import { services } from '@data/services'

const BASELINE_TIMESTAMP = '2025-07-01T08:00:00.000Z'

const promotionPriceCheckpoints = promotionConfigs
  .map((promotion) => ({
    promotion,
    changedAt: `${promotion.startDate}T08:00:00.000Z`,
  }))
  .sort((a, b) => {
    const first = new Date(a.promotion.startDate).getTime()
    const second = new Date(b.promotion.startDate).getTime()

    return first - second
  })

function toPricePoint(value: number, changedAt: string): PricePoint {
  return {
    value: Number(value.toFixed(0)),
    changedAt,
  }
}

function buildHistoryForService(service: Service): PriceHistoryEntry {
  const history: PricePoint[] = [
    toPricePoint(service.price, BASELINE_TIMESTAMP),
  ]

  for (const { promotion, changedAt } of promotionPriceCheckpoints) {
    const discount = doesPromotionApplyToService(service, promotion)
      ? promotion.discountPercentage / 100
      : 0

    const value = service.price * (1 - discount)

    history.push(toPricePoint(value, changedAt))
  }

  return {
    serviceId: service.id,
    history,
  }
}

const defaultServicePriceHistory: PriceHistoryEntry[] = services.map(
  buildHistoryForService,
)

function cloneHistory(entries: PriceHistoryEntry[]): PriceHistoryEntry[] {
  return entries.map((entry) => ({
    serviceId: entry.serviceId,
    history: entry.history.map((point) => ({ ...point })),
  }))
}

export const servicePriceHistory: PriceHistoryEntry[] = cloneHistory(
  defaultServicePriceHistory,
)

export function resetServicePriceHistory(entries: PriceHistoryEntry[] = []) {
  servicePriceHistory.splice(
    0,
    servicePriceHistory.length,
    ...cloneHistory(entries),
  )
}

export function restoreDefaultServicePriceHistory() {
  resetServicePriceHistory(defaultServicePriceHistory)
}
