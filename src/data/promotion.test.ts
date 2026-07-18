import type { Service, ServiceCatalogCategory } from '@app-types/types'
import { describe, expect, it } from 'vitest'
import {
  type ActivePromotion,
  doesPromotionApplyToService,
  formatPromotionDeadline,
  getAllActivePromotions,
  getPromotionScopeDescription,
  type PromotionApplicability,
  type PromotionConfig,
  resolveServicePromotion,
} from './promotion'
import { getServiceById, services } from './services'

const testConfigs: PromotionConfig[] = [
  {
    id: 'test-promo',
    discountPercentage: 20,
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    applicability: { type: 'all', description: 'wszystkie zabiegi' },
    ctaLabel: 'Book',
  },
]

describe('getAllActivePromotions date selection', () => {
  it('selects the correct active promotion by date', () => {
    const [promotion] = getAllActivePromotions(new Date('2025-10-15'))
    expect(promotion?.id).toBe('october-2025-oczyszczanie-wodorowe')
    expect(promotion?.discountPercentage).toBe(20)
  })

  it('preserves the October campaign service and visible scope copy', () => {
    const [promotion] = getAllActivePromotions(new Date('2025-10-15'))
    const promotedService = services.find(
      (service) => service.name === 'Oczyszczanie wodorowe',
    )

    expect(promotion).toBeDefined()
    expect(promotedService).toBeDefined()
    if (!promotion || !promotedService) return

    expect(promotedService.price).toBe(250)
    expect(doesPromotionApplyToService(promotedService, promotion)).toBe(true)
    expect(getPromotionScopeDescription(promotion)).toBe(
      'oczyszczanie wodorowe – z 250 zł na 200 zł',
    )
  })

  it('returns an empty list when no promotion is active', () => {
    const promotions = getAllActivePromotions(new Date('2025-03-15'))
    expect(promotions).toEqual([])
  })

  it('returns the promotion on the first day (boundary inclusive)', () => {
    const [promotion] = getAllActivePromotions(
      new Date('2025-10-01T00:00:01+02:00'),
      testConfigs,
    )
    expect(promotion?.id).toBe('test-promo')
  })

  it('returns the promotion on the last day (boundary inclusive)', () => {
    const [promotion] = getAllActivePromotions(
      new Date('2025-10-31T23:59:58+01:00'),
      testConfigs,
    )
    expect(promotion?.id).toBe('test-promo')
  })

  it('returns an empty list the day before a promotion starts', () => {
    const promotions = getAllActivePromotions(
      new Date('2025-09-30T23:59:58+02:00'),
      testConfigs,
    )
    expect(promotions).toEqual([])
  })

  it('returns an empty list the day after a promotion ends', () => {
    const promotions = getAllActivePromotions(
      new Date('2025-11-01T00:00:01+01:00'),
      testConfigs,
    )
    expect(promotions).toEqual([])
  })

  it('skips a malformed config and returns the next active promotion', () => {
    const malformedConfig: PromotionConfig = {
      ...testConfigs[0],
      id: 'malformed-promo',
      startDate: 'not-a-date',
    }

    const [promotion] = getAllActivePromotions(new Date('2025-10-15'), [
      malformedConfig,
      ...testConfigs,
    ])

    expect(promotion?.id).toBe('test-promo')
  })
})

describe('getAllActivePromotions', () => {
  it('returns every synthetic campaign active on the same date', () => {
    const secondConfig: PromotionConfig = {
      ...testConfigs[0],
      id: 'test-promo-second',
      discountPercentage: 15,
    }

    const promotions = getAllActivePromotions(new Date('2025-10-15'), [
      ...testConfigs,
      secondConfig,
    ])

    expect(promotions.map((promotion) => promotion.id)).toEqual([
      'test-promo',
      'test-promo-second',
    ])
  })

  it('returns only the October production campaign on its covered date', () => {
    const promotions = getAllActivePromotions(new Date('2025-10-15'))

    expect(promotions).toHaveLength(1)
    expect(promotions[0].id).toBe('october-2025-oczyszczanie-wodorowe')
  })

  it('returns all promotions active on a given date', () => {
    // November 2025 has one active promotion
    const promotions = getAllActivePromotions(new Date('2025-11-15'))
    expect(promotions).toHaveLength(1)
    expect(promotions[0].id).toBe(
      'november-december-2025-konsultacja-kosmetologiczna',
    )
  })

  it('returns empty array when no promotion is active', () => {
    const promotions = getAllActivePromotions(new Date('2025-08-15'))
    expect(promotions).toHaveLength(0)
  })

  it('skips a malformed config and returns the valid active promotions', () => {
    const malformedConfig: PromotionConfig = {
      ...testConfigs[0],
      id: 'malformed-promo',
      endDate: 'not-a-date',
    }

    const promotions = getAllActivePromotions(new Date('2025-10-15'), [
      malformedConfig,
      ...testConfigs,
    ])

    expect(promotions.map((promotion) => promotion.id)).toEqual(['test-promo'])
  })
})

describe('resolveServicePromotion', () => {
  const service: Service = {
    id: 'service-resolver-test',
    name: 'Resolver Test',
    catalogCategory: 'Kosmetologia',
    price: 250,
    duration: 60,
    isNext: false,
    description: 'desc',
  }

  const createPromotion = (
    id: string,
    discountPercentage: number,
    startDate = '2025-10-01T00:00:00.000Z',
    applicability: PromotionApplicability = {
      type: 'all',
      description: 'wszystkie zabiegi',
    },
  ): ActivePromotion => ({
    id,
    discountPercentage,
    startDate: new Date(startDate),
    endDate: new Date('2025-10-31T23:59:59.999Z'),
    applicability,
    ctaLabel: 'Book',
  })

  it('chooses the largest single discount without stacking or order dependence', () => {
    const weakerPromotion = createPromotion('weaker', 15)
    const strongerPromotion = createPromotion('stronger', 20)
    const promotions = [weakerPromotion, strongerPromotion]

    expect(resolveServicePromotion(service, promotions)).toEqual({
      promotion: strongerPromotion,
      discountedPrice: 200,
    })
    expect(resolveServicePromotion(service, [...promotions].reverse())).toEqual(
      {
        promotion: strongerPromotion,
        discountedPrice: 200,
      },
    )
  })

  it('uses the earlier campaign start to break equal-discount ties', () => {
    const laterPromotion = createPromotion(
      'later',
      20,
      '2025-10-10T00:00:00.000Z',
    )
    const earlierPromotion = createPromotion(
      'earlier',
      20,
      '2025-10-01T00:00:00.000Z',
    )

    expect(
      resolveServicePromotion(service, [laterPromotion, earlierPromotion])
        ?.promotion,
    ).toBe(earlierPromotion)
  })

  it('uses the lexical promotion ID to break equal discount and start ties', () => {
    const lexicalSecond = createPromotion('z-promotion', 20)
    const lexicalFirst = createPromotion('a-promotion', 20)

    expect(
      resolveServicePromotion(service, [lexicalSecond, lexicalFirst])
        ?.promotion,
    ).toBe(lexicalFirst)
  })

  it('returns a rounded integer current price', () => {
    const promotion = createPromotion('fractional-discount', 14.3)

    expect(
      resolveServicePromotion({ ...service, price: 333 }, [promotion])
        ?.discountedPrice,
    ).toBe(285)
  })

  it('returns null when no campaign applies', () => {
    const promotion = createPromotion('other-service', 20, undefined, {
      type: 'services',
      serviceIds: ['service-other'],
    })

    expect(resolveServicePromotion(service, [promotion])).toBeNull()
  })

  it('does not mutate the caller promotion array', () => {
    const promotions = [
      createPromotion('weaker', 15),
      createPromotion('stronger', 20),
    ]
    const originalOrder = [...promotions]

    resolveServicePromotion(service, promotions)

    expect(promotions).toEqual(originalOrder)
  })
})

describe('formatPromotionDeadline', () => {
  it('formats full-month promotions as "przez cały <month>"', () => {
    const [promotion] = getAllActivePromotions(new Date('2025-09-10'))
    expect(promotion).toBeDefined()
    if (!promotion) return

    expect(formatPromotionDeadline(promotion)).toMatch(/przez cały wrzesień/i)
  })

  it('formats partial-month promotions as "do <date>"', () => {
    // A promotion that does NOT start on the 1st or end on the last day
    const promotion: ActivePromotion = {
      id: 'partial',
      discountPercentage: 10,
      startDate: new Date('2025-10-05'),
      endDate: new Date('2025-10-25T23:59:59.999'),
      applicability: {
        type: 'all' as const,
        description: 'wszystkie zabiegi',
      },
      ctaLabel: 'Book',
    }
    const result = formatPromotionDeadline(promotion)
    expect(result).toMatch(/^do /)
    expect(result).not.toMatch(/przez cały/)
  })

  it('formats multi-month promotions as "do <date>"', () => {
    const [promotion] = getAllActivePromotions(new Date('2025-11-15'))
    expect(promotion).toBeDefined()
    if (!promotion) return

    // November–December promotion spans two months — should use date format
    const result = formatPromotionDeadline(promotion)
    expect(result).toMatch(/^do /)
  })
})

describe('getPromotionScopeDescription', () => {
  it('returns the description for "all" type promotions', () => {
    const promotion: ActivePromotion = {
      id: 'all',
      discountPercentage: 20,
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-09-30'),
      applicability: {
        type: 'all' as const,
        description: 'wszystkie zabiegi',
      },
      ctaLabel: 'Book',
    }
    expect(getPromotionScopeDescription(promotion)).toBe('wszystkie zabiegi')
  })

  it('describes scope for a single category (no description)', () => {
    const promotion = {
      id: 'cat',
      discountPercentage: 10,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      applicability: {
        type: 'categories' as const,
        categories: ['Kosmetologia'] as ServiceCatalogCategory[],
      },
      ctaLabel: 'Book',
    }
    expect(getPromotionScopeDescription(promotion)).toBe(
      'zabiegi z kategorii kosmetologia',
    )
  })

  it('joins multiple categories with "oraz"', () => {
    const categoryApplicability: PromotionApplicability = {
      type: 'categories',
      categories: ['Kosmetologia', 'Trychologia'],
    }

    expect(
      getPromotionScopeDescription({
        id: 'cat',
        discountPercentage: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        applicability: categoryApplicability,
        ctaLabel: 'Book',
      }),
    ).toBe('kosmetologia oraz trychologia')
  })

  it('returns the custom description for categories when provided', () => {
    const promotion = {
      id: 'cat-desc',
      discountPercentage: 10,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      applicability: {
        type: 'categories' as const,
        categories: ['Kosmetologia'] as ServiceCatalogCategory[],
        description: 'wybrane zabiegi kosmetologiczne',
      },
      ctaLabel: 'Book',
    }
    expect(getPromotionScopeDescription(promotion)).toBe(
      'wybrane zabiegi kosmetologiczne',
    )
  })

  it('lowercases a single service name when no description is provided', () => {
    const serviceApplicability: PromotionApplicability = {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
    }

    expect(
      getPromotionScopeDescription(
        {
          id: 'svc',
          discountPercentage: 15,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-28'),
          applicability: serviceApplicability,
          ctaLabel: 'Book',
        },
        getServiceById,
      ),
    ).toBe('pierwsza konsultacja kosmetologiczna z zabiegiem')
  })

  it('joins multiple service names with "oraz"', () => {
    const promotion: ActivePromotion = {
      id: 'multi-svc',
      discountPercentage: 10,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      applicability: {
        type: 'services' as const,
        serviceIds: ['service-oczyszczanie-wodorowe', 'service-regulacja-brwi'],
      },
      ctaLabel: 'Book',
    }
    expect(getPromotionScopeDescription(promotion, getServiceById)).toBe(
      'oczyszczanie wodorowe oraz regulacja brwi',
    )
  })

  it('uses generic copy when a service ID cannot be resolved', () => {
    const promotion: ActivePromotion = {
      id: 'unknown-service',
      discountPercentage: 10,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      applicability: {
        type: 'services' as const,
        serviceIds: ['service-nieznany'],
      },
      ctaLabel: 'Book',
    }

    expect(getPromotionScopeDescription(promotion)).toBe('wybrane zabiegi')
  })
})

describe('doesPromotionApplyToService', () => {
  it('checks applicability across promotion types', () => {
    const service: Service = {
      id: 'service-oczyszczanie-wodorowe',
      name: 'Oczyszczanie wodorowe',
      catalogCategory: 'Kosmetologia',
      price: 250,
      duration: 60,
      isNext: false,
      description: 'desc',
    }

    const allApplicability: PromotionApplicability = {
      type: 'all',
      description: 'wszystkie zabiegi',
    }

    const categoryApplicability: PromotionApplicability = {
      type: 'categories',
      categories: ['Kosmetologia'],
    }

    const servicesApplicability: PromotionApplicability = {
      type: 'services',
      serviceIds: ['service-inny-zabieg'],
    }

    expect(
      doesPromotionApplyToService(service, {
        id: 'all',
        discountPercentage: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        applicability: allApplicability,
        ctaLabel: 'Book',
      }),
    ).toBe(true)

    expect(
      doesPromotionApplyToService(service, {
        id: 'cat',
        discountPercentage: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        applicability: categoryApplicability,
        ctaLabel: 'Book',
      }),
    ).toBe(true)

    expect(
      doesPromotionApplyToService(service, {
        id: 'svc',
        discountPercentage: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        applicability: servicesApplicability,
        ctaLabel: 'Book',
      }),
    ).toBe(false)
  })

  it('keeps an ID-targeted campaign attached after a display-name change', () => {
    const service: Service = {
      ...services.find(
        (candidate) => candidate.id === 'service-oczyszczanie-wodorowe',
      )!,
      name: 'Nowa nazwa prezentacyjna',
    }
    const [promotion] = getAllActivePromotions(new Date('2025-10-15'))

    expect(promotion).toBeDefined()
    if (!promotion) return

    expect(doesPromotionApplyToService(service, promotion)).toBe(true)
  })
})
