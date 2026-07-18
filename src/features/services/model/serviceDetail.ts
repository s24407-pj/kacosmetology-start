import type { ServiceSpecializationId } from '@app-types/types'
import { getDetailServiceBySpecializationSlug } from '@data/services'

export function loadServiceDetail(
  specializationId: ServiceSpecializationId,
  slug: string,
) {
  return getDetailServiceBySpecializationSlug(specializationId, slug)
}
