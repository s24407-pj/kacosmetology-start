import type { PublicService } from '@app-types/types'
import { describe, expect, it } from 'vitest'
import { promotionConfigs } from './promotion'
import { getServicePriceHistory } from './servicePriceHistory'
import { getServiceById, services } from './services'
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

describe('validateServices', () => {
  const fixture = (id: Parameters<typeof getServiceById>[0]): PublicService => {
    const service = getServiceById(id)
    if (!service) throw new Error(`Missing fixture service ${id}`)
    return {
      ...service,
      relatedServiceIds: [],
      requiresPriorConsultation: false,
    }
  }
  const cosmetology = fixture('service-oczyszczanie-wodorowe')
  const trichology = fixture('service-pierwsza-konsultacja-trychologiczna')

  const validate = (catalog: PublicService[]) =>
    validateServices({
      services: catalog,
      getPriceHistory: getServicePriceHistory,
      promotions: [],
    })

  it('accepts a consistent catalog', () => {
    expect(validate([cosmetology, trichology])).toEqual([])
  })

  it('rejects a duplicate slug within one area', () => {
    const duplicate = {
      ...trichology,
      area: cosmetology.area,
      category: cosmetology.category,
      slug: cosmetology.slug,
    }

    expect(validate([cosmetology, duplicate])).toContainEqual(
      expect.stringContaining('duplicate slug'),
    )
  })

  it('rejects a detail page for an unpublished service', () => {
    const unpublished = {
      ...cosmetology,
      isPublished: false,
      hasDetailPage: true,
    }

    expect(validate([unpublished])).toContainEqual(
      expect.stringContaining('detail page requires a published service'),
    )
  })

  it('rejects a related service from another area', () => {
    const crossArea = { ...cosmetology, relatedServiceIds: [trichology.id] }

    expect(validate([crossArea, trichology])).toContainEqual(
      expect.stringContaining('belongs to another area'),
    )
  })

  it('rejects a service without price history', () => {
    expect(
      validateServices({
        services: [cosmetology],
        getPriceHistory: () => [],
        promotions: [],
      }),
    ).toContainEqual(expect.stringContaining('price history is missing'))
  })
})
