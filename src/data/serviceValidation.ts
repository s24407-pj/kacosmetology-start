import type {
  PricePoint,
  PublicService,
  ServiceArea,
  ServiceCategory,
} from '@app-types/types'
import type { PromotionConfig } from './promotion'
import type { Specialization } from './specializations'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_AREAS: readonly ServiceArea[] = ['cosmetology', 'trichology']
const VALID_CATEGORIES: readonly ServiceCategory[] = [
  'cosmetology',
  'eye-styling',
  'trichology',
  'online',
]

export interface ServiceValidationDependencies {
  services: readonly PublicService[]
  getPriceHistory: (serviceId: PublicService['id']) => PricePoint[]
  promotions: readonly PromotionConfig[]
  specializations?: readonly Specialization[]
}

export function validateServices({
  services,
  getPriceHistory,
  promotions,
  specializations,
}: ServiceValidationDependencies): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const slugs = new Set<string>()
  const byId = new Map(services.map((service) => [service.id, service]))

  for (const service of services) {
    const label = `Service ${service.id}`
    if (ids.has(service.id)) errors.push(`${label}: duplicate service ID`)
    ids.add(service.id)

    const slugKey = `${service.area}:${service.slug}`
    if (slugs.has(slugKey)) {
      errors.push(
        `${label}: duplicate slug "${service.slug}" in ${service.area}`,
      )
    }
    slugs.add(slugKey)

    if (!SLUG_PATTERN.test(service.slug)) {
      errors.push(`${label}: slug "${service.slug}" has an invalid format`)
    }
    if (!VALID_AREAS.includes(service.area)) {
      errors.push(`${label}: invalid area "${service.area}"`)
    }
    if (!VALID_CATEGORIES.includes(service.category)) {
      errors.push(`${label}: invalid category "${service.category}"`)
    }
    if (service.category === 'trichology' && service.area !== 'trichology') {
      errors.push(`${label}: trichology category must use trichology area`)
    }
    if (
      (service.category === 'cosmetology' ||
        service.category === 'eye-styling') &&
      service.area !== 'cosmetology'
    ) {
      errors.push(`${label}: ${service.category} must use cosmetology area`)
    }
    if (!service.name.trim()) errors.push(`${label}: name must not be empty`)
    if (!service.shortDescription.trim()) {
      errors.push(`${label}: short description must not be empty`)
    }
    if (service.price <= 0) errors.push(`${label}: price must be positive`)
    if (service.duration <= 0)
      errors.push(`${label}: duration must be positive`)
    if (service.hasDetailPage && !service.isPublished) {
      errors.push(`${label}: detail page requires a published service`)
    }
    if (
      new Set(service.relatedServiceIds).size !==
      service.relatedServiceIds.length
    ) {
      errors.push(`${label}: duplicate related service ID`)
    }
    for (const relatedId of service.relatedServiceIds) {
      const related = byId.get(relatedId)
      if (relatedId === service.id)
        errors.push(`${label}: cannot relate to itself`)
      if (!related)
        errors.push(`${label}: unknown related service ${relatedId}`)
      else {
        if (!related.isPublished)
          errors.push(`${label}: related service ${relatedId} is unpublished`)
        if (related.area !== service.area)
          errors.push(
            `${label}: related service ${relatedId} belongs to another area`,
          )
      }
    }
    if (service.requiresPriorConsultation) {
      const hasConsultation = service.relatedServiceIds.some((id) =>
        id.includes('pierwsza-konsultacja'),
      )
      if (!hasConsultation)
        errors.push(`${label}: prior consultation relation is required`)
    }
    if (getPriceHistory(service.id).length === 0) {
      errors.push(`${label}: price history is missing`)
    }
  }

  for (const promotion of promotions) {
    if (promotion.applicability.type !== 'services') continue
    for (const serviceId of promotion.applicability.serviceIds) {
      if (!byId.has(serviceId)) {
        errors.push(`Promotion ${promotion.id}: unknown service ${serviceId}`)
      }
    }
  }

  for (const specialization of specializations ?? []) {
    const actualCount = services.filter(
      (service) =>
        service.isPublished &&
        service.hasDetailPage &&
        service.category === specialization.category,
    ).length
    if (actualCount !== specialization.stationaryServiceCount) {
      errors.push(
        `Specialization ${specialization.id}: expected ${specialization.stationaryServiceCount} stationary services, found ${actualCount}`,
      )
    }
  }

  return errors
}
