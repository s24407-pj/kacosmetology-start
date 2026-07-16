import { describe, expect, expectTypeOf, it } from 'vitest'
import type { Service, ServiceCatalogCategory } from './types'

const catalogCategories = [
  'Oprawa oka',
  'Trychologia',
  'Kosmetologia',
  'Online',
] as const satisfies readonly ServiceCatalogCategory[]

describe('service catalog category contract', () => {
  it('uses the four catalog taxonomy values on Service', () => {
    expectTypeOf<
      Service['catalogCategory']
    >().toEqualTypeOf<ServiceCatalogCategory>()
    expectTypeOf<ServiceCatalogCategory>().toEqualTypeOf<
      (typeof catalogCategories)[number]
    >()
    expect(catalogCategories).toHaveLength(4)
  })

  it('excludes services-section-only views', () => {
    expectTypeOf<
      Extract<ServiceCatalogCategory, 'Vouchery' | 'Promocje'>
    >().toEqualTypeOf<never>()
  })
})
