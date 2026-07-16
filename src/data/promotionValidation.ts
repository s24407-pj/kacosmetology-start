import type { Service } from '@app-types/types'
import type { PromotionConfig } from './promotion'

export type PromotionConfigIssueCode =
  | 'blank-id'
  | 'duplicate-id'
  | 'invalid-start-date'
  | 'invalid-end-date'
  | 'reversed-date-range'
  | 'unknown-service'
  | 'unknown-category'

export interface PromotionConfigIssue {
  code: PromotionConfigIssueCode
  configIndex: number
  promotionId: string
  field: 'id' | 'startDate' | 'endDate' | 'applicability'
  reference?: string
}

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isValidDateKey = (value: string): boolean => {
  if (!DATE_KEY_PATTERN.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

const countValues = (values: readonly string[]): Map<string, number> => {
  const counts = new Map<string, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return counts
}

export const validatePromotionConfigs = (
  configs: readonly PromotionConfig[],
  catalog: readonly Service[],
): PromotionConfigIssue[] => {
  const issues: PromotionConfigIssue[] = []
  const promotionIdCounts = countValues(configs.map((config) => config.id))
  const serviceIdCounts = countValues(catalog.map((service) => service.id))
  const catalogCategories = new Set(
    catalog.map((service) => service.catalogCategory),
  )

  configs.forEach((config, configIndex) => {
    const issueIdentity = {
      configIndex,
      promotionId: config.id,
    }

    if (config.id.trim().length === 0) {
      issues.push({
        code: 'blank-id',
        ...issueIdentity,
        field: 'id',
      })
    }

    if ((promotionIdCounts.get(config.id) ?? 0) > 1) {
      issues.push({
        code: 'duplicate-id',
        ...issueIdentity,
        field: 'id',
      })
    }

    const hasValidStartDate = isValidDateKey(config.startDate)
    const hasValidEndDate = isValidDateKey(config.endDate)

    if (!hasValidStartDate) {
      issues.push({
        code: 'invalid-start-date',
        ...issueIdentity,
        field: 'startDate',
      })
    }

    if (!hasValidEndDate) {
      issues.push({
        code: 'invalid-end-date',
        ...issueIdentity,
        field: 'endDate',
      })
    }

    if (
      hasValidStartDate &&
      hasValidEndDate &&
      config.startDate > config.endDate
    ) {
      issues.push({
        code: 'reversed-date-range',
        ...issueIdentity,
        field: 'endDate',
      })
    }

    if (config.applicability.type === 'services') {
      for (const serviceId of config.applicability.serviceIds) {
        if (serviceIdCounts.get(serviceId) !== 1) {
          issues.push({
            code: 'unknown-service',
            ...issueIdentity,
            field: 'applicability',
            reference: serviceId,
          })
        }
      }
    }

    if (config.applicability.type === 'categories') {
      for (const category of config.applicability.categories) {
        if (!catalogCategories.has(category)) {
          issues.push({
            code: 'unknown-category',
            ...issueIdentity,
            field: 'applicability',
            reference: category,
          })
        }
      }
    }
  })

  return issues
}
