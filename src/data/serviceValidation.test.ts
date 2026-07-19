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
})
