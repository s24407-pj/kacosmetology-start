import type { Service } from '@app-types/types'
import {
  type ActivePromotion,
  getAllActivePromotions,
  resolveServicePromotion,
} from '@data/promotion'
import { getServicePriceHistory } from '@data/servicePriceHistory'
import { getLowestPriceInLastDays } from './priceHistory'

export interface ServicePricingPresentation {
  standardPrice: number
  currentPrice: number
  activePromotion: ActivePromotion | null
  lowestPriceInLast30Days?: number
}

export function getServicePricing(
  service: Service,
  referenceDate: Date = new Date(),
): ServicePricingPresentation {
  const resolution = resolveServicePromotion(
    service,
    getAllActivePromotions(referenceDate),
  )
  const promotionAge = resolution
    ? referenceDate.getTime() - resolution.promotion.startDate.getTime()
    : 0
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const lowestPriceReferenceDate =
    resolution && promotionAge < thirtyDays
      ? new Date(resolution.promotion.startDate.getTime() - 1)
      : referenceDate

  return {
    standardPrice: service.price,
    currentPrice: resolution?.discountedPrice ?? service.price,
    activePromotion: resolution?.promotion ?? null,
    lowestPriceInLast30Days: resolution
      ? getLowestPriceInLastDays(
          getServicePriceHistory(service.id),
          30,
          lowestPriceReferenceDate,
        )
      : undefined,
  }
}
