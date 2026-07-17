import type {
  Service,
  ServiceCatalogCategory,
  ServiceId,
} from '@app-types/types'
import { getServiceById } from '@data/services'

interface PromotionApplicabilityAll {
  type: 'all'
  description: string
}

interface PromotionApplicabilityCategories {
  type: 'categories'
  categories: ServiceCatalogCategory[]
  description?: string
}

interface PromotionApplicabilityServices {
  type: 'services'
  serviceIds: ServiceId[]
  description?: string
}

export type PromotionApplicability =
  | PromotionApplicabilityAll
  | PromotionApplicabilityCategories
  | PromotionApplicabilityServices

export interface PromotionConfig {
  id: string
  discountPercentage: number
  startDate: string
  endDate: string
  applicability: PromotionApplicability
  ctaLabel: string
}

export interface ActivePromotion
  extends Omit<PromotionConfig, 'startDate' | 'endDate'> {
  startDate: Date
  endDate: Date
}

export interface ServicePromotionResolution {
  promotion: ActivePromotion
  discountedPrice: number
}

export const promotionConfigs: PromotionConfig[] = [
  {
    id: 'september-2025-all-services',
    discountPercentage: 20,
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    applicability: {
      type: 'all',
      description: 'wszystkie zabiegi',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'october-2025-oczyszczanie-wodorowe',
    discountPercentage: 20,
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-oczyszczanie-wodorowe'],
      description: 'oczyszczanie wodorowe – z 250 zł na 200 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'november-december-2025-konsultacja-kosmetologiczna',
    discountPercentage: 28.5,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 250 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'january-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'february-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'march-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'april-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'may-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'june-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'july-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'august-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'september-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'october-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'november-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
  {
    id: 'december-2026-konsultacja-kosmetologiczna',
    discountPercentage: 14.3,
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    applicability: {
      type: 'services',
      serviceIds: ['service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'],
      description:
        'Pierwsza konsultacja kosmetologiczna z zabiegiem – z 350 zł na 300 zł',
    },
    ctaLabel: 'Zarezerwuj termin',
  },
]

type PromotionLike = PromotionConfig | ActivePromotion

const WARSAW_TIME_ZONE = 'Europe/Warsaw'

const getWarsawDateKey = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: WARSAW_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  )
  return `${values.year}-${values.month}-${values.day}`
}

const toPromotionDates = (config: PromotionConfig) => ({
  startDate: new Date(`${config.startDate}T00:00:00.000Z`),
  endDate: new Date(`${config.endDate}T23:59:59.999Z`),
})

export function getReferenceDate(): Date {
  return new Date()
}

export function getAllActivePromotions(
  referenceDate: Date = getReferenceDate(),
  configs: PromotionConfig[] = promotionConfigs,
): ActivePromotion[] {
  const activePromotions: ActivePromotion[] = []
  const referenceDateKey = getWarsawDateKey(referenceDate)

  for (const promotionConfig of configs) {
    const { startDate, endDate } = toPromotionDates(promotionConfig)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      continue
    }

    if (
      referenceDateKey < promotionConfig.startDate ||
      referenceDateKey > promotionConfig.endDate
    ) {
      continue
    }

    activePromotions.push({
      ...promotionConfig,
      startDate,
      endDate,
    })
  }

  return activePromotions
}

export function doesPromotionApplyToService(
  service: Service,
  promotion: PromotionLike,
): boolean {
  if (promotion.applicability.type === 'all') {
    return true
  }

  if (promotion.applicability.type === 'categories') {
    return promotion.applicability.categories.includes(service.catalogCategory)
  }

  return promotion.applicability.serviceIds.includes(service.id)
}

export function resolveServicePromotion(
  service: Service,
  activePromotions: readonly ActivePromotion[],
): ServicePromotionResolution | null {
  let winningPromotion: ActivePromotion | null = null

  for (const promotion of activePromotions) {
    if (!doesPromotionApplyToService(service, promotion)) {
      continue
    }

    if (!winningPromotion) {
      winningPromotion = promotion
      continue
    }

    const hasLargerDiscount =
      promotion.discountPercentage > winningPromotion.discountPercentage
    const hasEqualDiscount =
      promotion.discountPercentage === winningPromotion.discountPercentage
    const startsEarlier =
      promotion.startDate.getTime() < winningPromotion.startDate.getTime()
    const startsAtSameTime =
      promotion.startDate.getTime() === winningPromotion.startDate.getTime()
    const hasLexicallySmallerId = promotion.id < winningPromotion.id

    if (
      hasLargerDiscount ||
      (hasEqualDiscount && startsEarlier) ||
      (hasEqualDiscount && startsAtSameTime && hasLexicallySmallerId)
    ) {
      winningPromotion = promotion
    }
  }

  if (!winningPromotion) {
    return null
  }

  return {
    promotion: winningPromotion,
    discountedPrice: Number(
      (service.price * (1 - winningPromotion.discountPercentage / 100)).toFixed(
        0,
      ),
    ),
  }
}

export function getPromotionScopeDescription(
  promotion: ActivePromotion,
): string {
  if (promotion.applicability.type === 'all') {
    return promotion.applicability.description
  }

  if (promotion.applicability.type === 'categories') {
    if (promotion.applicability.description) {
      return promotion.applicability.description
    }

    if (promotion.applicability.categories.length === 1) {
      return `zabiegi z kategorii ${promotion.applicability.categories[0].toLowerCase()}`
    }

    const categories = promotion.applicability.categories.map((category) =>
      category.toLowerCase(),
    )
    const lastCategory = categories.pop()
    if (!lastCategory) {
      return 'wybrane zabiegi'
    }

    return `${categories.join(', ')} oraz ${lastCategory}`
  }

  if (promotion.applicability.description) {
    return promotion.applicability.description
  }

  const resolvedServices = promotion.applicability.serviceIds.map((serviceId) =>
    getServiceById(serviceId),
  )
  if (
    resolvedServices.length === 0 ||
    resolvedServices.some((service) => !service)
  ) {
    return 'wybrane zabiegi'
  }

  const resolvedServiceNames = resolvedServices.map((service) =>
    service?.name.toLowerCase(),
  )
  if (resolvedServiceNames.length === 1) {
    return resolvedServiceNames[0] ?? 'wybrane zabiegi'
  }

  const lastServiceName = resolvedServiceNames.pop()
  if (!lastServiceName) {
    return 'wybrane zabiegi'
  }

  return `${resolvedServiceNames.join(', ')} oraz ${lastServiceName}`
}

export function formatPromotionDeadline(promotion: ActivePromotion): string {
  const { startDate, endDate } = promotion

  const coversSingleMonth =
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth()

  const startsAtBeginningOfMonth =
    startDate.getUTCDate() === 1 &&
    startDate.getUTCHours() === 0 &&
    startDate.getUTCMinutes() === 0 &&
    startDate.getUTCSeconds() === 0 &&
    startDate.getUTCMilliseconds() === 0

  const endOfMonth = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 0),
  )
  const endsAtLastDayOfMonth =
    endDate.getUTCDate() === endOfMonth.getUTCDate() &&
    endDate.getUTCHours() === 23 &&
    endDate.getUTCMinutes() === 59 &&
    endDate.getUTCSeconds() === 59 &&
    endDate.getUTCMilliseconds() === 999

  if (coversSingleMonth && startsAtBeginningOfMonth && endsAtLastDayOfMonth) {
    const monthFormatter = new Intl.DateTimeFormat('pl-PL', {
      month: 'long',
      timeZone: 'UTC',
    })
    return `przez cały ${monthFormatter.format(startDate)}`
  }

  const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })

  return `do ${dateFormatter.format(endDate)}`
}
