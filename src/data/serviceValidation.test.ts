import { describe, expect, it } from 'vitest'
import { promotionConfigs } from './promotion'
import { getServicePriceHistory } from './servicePriceHistory'
import { services } from './services'
import { validateServices } from './serviceValidation'
import { specializations } from './specializations'

describe('production service catalog', () => {
  it('is internally consistent', () => {
    expect(
      validateServices({
        services,
        getPriceHistory: getServicePriceHistory,
        promotions: promotionConfigs,
        specializations,
      }),
    ).toEqual([])
  })

  it('publishes 24 stationary details and keeps all 26 services bookable', () => {
    expect(services).toHaveLength(26)
    expect(services.filter((service) => service.hasDetailPage)).toHaveLength(24)
  })

  it('keeps presentation counts aligned with stationary service categories', () => {
    expect(
      specializations.map((specialization) => [
        specialization.id,
        specialization.stationaryServiceCount,
      ]),
    ).toEqual([
      ['cosmetology', 12],
      ['eye-styling', 7],
      ['trichology', 5],
    ])
  })
})
