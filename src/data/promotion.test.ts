import type { Service, ServiceCategory } from '@app-types/types'
import { describe, expect, it } from 'vitest'
import {
  doesPromotionApplyToService,
  formatPromotionDeadline,
  getActivePromotion,
  getAllActivePromotions,
  getPromotionScopeDescription,
  type PromotionApplicability,
  type PromotionConfig,
} from './promotion'

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

describe('getActivePromotion', () => {
  it('selects the correct active promotion by date', () => {
    const promotion = getActivePromotion(new Date('2025-10-15'))
    expect(promotion?.id).toBe('october-2025-oczyszczanie-wodorowe')
    expect(promotion?.discountPercentage).toBe(20)
  })

  it('returns null when no promotion is active', () => {
    const promotion = getActivePromotion(new Date('2025-03-15'))
    expect(promotion).toBeNull()
  })

  it('returns the promotion on the first day (boundary inclusive)', () => {
    const promotion = getActivePromotion(
      new Date('2025-10-01T00:00:01+02:00'),
      testConfigs,
    )
    expect(promotion?.id).toBe('test-promo')
  })

  it('returns the promotion on the last day (boundary inclusive)', () => {
    const promotion = getActivePromotion(
      new Date('2025-10-31T23:59:58+01:00'),
      testConfigs,
    )
    expect(promotion?.id).toBe('test-promo')
  })

  it('returns null the day before a promotion starts', () => {
    const promotion = getActivePromotion(
      new Date('2025-09-30T23:59:58+02:00'),
      testConfigs,
    )
    expect(promotion).toBeNull()
  })

  it('returns null the day after a promotion ends', () => {
    const promotion = getActivePromotion(
      new Date('2025-11-01T00:00:01+01:00'),
      testConfigs,
    )
    expect(promotion).toBeNull()
  })
})

describe('getAllActivePromotions', () => {
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
})

describe('formatPromotionDeadline', () => {
  it('formats full-month promotions as "przez cały <month>"', () => {
    const promotion = getActivePromotion(new Date('2025-09-10'))
    expect(promotion).not.toBeNull()
    if (!promotion) return

    expect(formatPromotionDeadline(promotion)).toMatch(/przez cały wrzesień/i)
  })

  it('formats partial-month promotions as "do <date>"', () => {
    // A promotion that does NOT start on the 1st or end on the last day
    const promotion = {
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
    const promotion = getActivePromotion(new Date('2025-11-15'))
    expect(promotion).not.toBeNull()
    if (!promotion) return

    // November–December promotion spans two months — should use date format
    const result = formatPromotionDeadline(promotion)
    expect(result).toMatch(/^do /)
  })
})

describe('getPromotionScopeDescription', () => {
  it('returns the description for "all" type promotions', () => {
    const promotion = {
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
        categories: ['Kosmetologia'] as ServiceCategory[],
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
        categories: ['Kosmetologia'] as ServiceCategory[],
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
      serviceNames: ['Pierwsza konsultacja kosmetologiczna z zabiegiem'],
    }

    expect(
      getPromotionScopeDescription({
        id: 'svc',
        discountPercentage: 15,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-28'),
        applicability: serviceApplicability,
        ctaLabel: 'Book',
      }),
    ).toBe('pierwsza konsultacja kosmetologiczna z zabiegiem')
  })

  it('joins multiple service names with "oraz"', () => {
    const promotion = {
      id: 'multi-svc',
      discountPercentage: 10,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      applicability: {
        type: 'services' as const,
        serviceNames: ['Zabieg A', 'Zabieg B'],
      },
      ctaLabel: 'Book',
    }
    expect(getPromotionScopeDescription(promotion)).toBe(
      'zabieg a oraz zabieg b',
    )
  })
})

describe('doesPromotionApplyToService', () => {
  it('checks applicability across promotion types', () => {
    const service: Service = {
      name: 'Oczyszczanie wodorowe',
      category: 'Kosmetologia',
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
      serviceNames: ['Inny zabieg'],
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
})
