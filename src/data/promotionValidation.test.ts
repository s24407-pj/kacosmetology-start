import type { Service, ServiceCatalogCategory } from '@app-types/types'
import { describe, expect, it } from 'vitest'
import { type PromotionConfig, promotionConfigs } from './promotion'
import { validatePromotionConfigs } from './promotionValidation'
import { services } from './services'

const catalog = [
  {
    id: 'service-testowy',
    name: 'Zabieg testowy',
    catalogCategory: 'Kosmetologia',
    price: 100,
    duration: 60,
    isNext: false,
    description: 'Opis testowy',
  },
] satisfies readonly Service[]

const validConfig: PromotionConfig = {
  id: 'promotion-valid',
  discountPercentage: 10,
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  applicability: {
    type: 'services',
    serviceIds: ['service-testowy'],
  },
}

describe('validatePromotionConfigs', () => {
  it('accepts a valid configuration and catalog', () => {
    expect(validatePromotionConfigs([validConfig], catalog)).toEqual([])
  })

  it('reports a blank promotion ID', () => {
    expect(
      validatePromotionConfigs([{ ...validConfig, id: '   ' }], catalog),
    ).toEqual([
      {
        code: 'blank-id',
        configIndex: 0,
        promotionId: '   ',
        field: 'id',
      },
    ])
  })

  it('reports every occurrence of a duplicate promotion ID', () => {
    expect(
      validatePromotionConfigs([validConfig, validConfig], catalog),
    ).toEqual([
      {
        code: 'duplicate-id',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'id',
      },
      {
        code: 'duplicate-id',
        configIndex: 1,
        promotionId: 'promotion-valid',
        field: 'id',
      },
    ])
  })

  it('rejects a malformed start-date shape', () => {
    expect(
      validatePromotionConfigs(
        [{ ...validConfig, startDate: '2026-1-01' }],
        catalog,
      ),
    ).toEqual([
      {
        code: 'invalid-start-date',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'startDate',
      },
    ])
  })

  it('rejects an impossible calendar date', () => {
    expect(
      validatePromotionConfigs(
        [{ ...validConfig, startDate: '2026-02-30' }],
        catalog,
      ),
    ).toEqual([
      {
        code: 'invalid-start-date',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'startDate',
      },
    ])
  })

  it('reports an invalid end date independently', () => {
    expect(
      validatePromotionConfigs(
        [{ ...validConfig, endDate: 'not-a-date' }],
        catalog,
      ),
    ).toEqual([
      {
        code: 'invalid-end-date',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'endDate',
      },
    ])
  })

  it('reports a reversed valid date range', () => {
    expect(
      validatePromotionConfigs(
        [
          {
            ...validConfig,
            startDate: '2026-02-01',
            endDate: '2026-01-31',
          },
        ],
        catalog,
      ),
    ).toEqual([
      {
        code: 'reversed-date-range',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'endDate',
      },
    ])
  })

  it('reports a service reference that does not resolve exactly once', () => {
    const duplicateCatalog = [catalog[0], { ...catalog[0] }]

    expect(validatePromotionConfigs([validConfig], duplicateCatalog)).toEqual([
      {
        code: 'unknown-service',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'applicability',
        reference: 'service-testowy',
      },
    ])
  })

  it('reports a category absent from the catalog', () => {
    const unknownCategory = [
      'Nieistniejąca',
    ] as unknown as ServiceCatalogCategory[]
    const config: PromotionConfig = {
      ...validConfig,
      applicability: {
        type: 'categories',
        categories: unknownCategory,
      },
    }

    expect(validatePromotionConfigs([config], catalog)).toEqual([
      {
        code: 'unknown-category',
        configIndex: 0,
        promotionId: 'promotion-valid',
        field: 'applicability',
        reference: 'Nieistniejąca',
      },
    ])
  })

  it('returns independent issues in stable configuration order', () => {
    const configs: PromotionConfig[] = [
      {
        ...validConfig,
        id: 'duplicate',
        startDate: 'invalid',
      },
      {
        ...validConfig,
        id: 'duplicate',
        startDate: '2026-02-01',
        endDate: '2026-01-31',
        applicability: {
          type: 'services',
          serviceIds: ['service-nieznany'],
        },
      },
    ]

    expect(validatePromotionConfigs(configs, catalog)).toEqual([
      {
        code: 'duplicate-id',
        configIndex: 0,
        promotionId: 'duplicate',
        field: 'id',
      },
      {
        code: 'invalid-start-date',
        configIndex: 0,
        promotionId: 'duplicate',
        field: 'startDate',
      },
      {
        code: 'duplicate-id',
        configIndex: 1,
        promotionId: 'duplicate',
        field: 'id',
      },
      {
        code: 'reversed-date-range',
        configIndex: 1,
        promotionId: 'duplicate',
        field: 'endDate',
      },
      {
        code: 'unknown-service',
        configIndex: 1,
        promotionId: 'duplicate',
        field: 'applicability',
        reference: 'service-nieznany',
      },
    ])
  })

  it('accepts the complete production promotion set', () => {
    expect(validatePromotionConfigs(promotionConfigs, services)).toEqual([])
  })
})
