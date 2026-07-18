import { describe, expect, it } from 'vitest'
import {
  getDetailServiceBySlug,
  getDetailServiceBySpecializationSlug,
  getPublicServiceBySlug,
  getPublicServicePath,
  getPublishedServices,
  getRelatedServices,
  getServiceById,
  getServicesByArea,
  services,
} from './services'

const SERVICE_ID_PATTERN = /^service-[a-z0-9]+(?:-[a-z0-9]+)*$/

describe('service catalog identity', () => {
  it('assigns every service a unique namespaced kebab-case ID', () => {
    const serviceIds = services.map((service) => service.id)

    expect(serviceIds).toHaveLength(26)
    expect(new Set(serviceIds).size).toBe(serviceIds.length)
    for (const serviceId of serviceIds) {
      expect(serviceId).toMatch(SERVICE_ID_PATTERN)
    }
  })

  it('resolves catalog presentation through the stable service ID', () => {
    expect(getServiceById('service-oczyszczanie-wodorowe')?.name).toBe(
      'Oczyszczanie wodorowe',
    )
    expect(getServiceById('service-nieznany')).toBeUndefined()
  })

  it('projects public services without replacing stable IDs', () => {
    expect(getServicesByArea('cosmetology')).toHaveLength(20)
    expect(getServicesByArea('trichology')).toHaveLength(6)
    expect(getPublishedServices()).toHaveLength(26)
    const service = getPublicServiceBySlug(
      'cosmetology',
      'oczyszczanie-wodorowe',
    )
    expect(service?.id).toBe('service-oczyszczanie-wodorowe')
    expect(service && getPublicServicePath(service)).toBe(
      '/kosmetologia/oczyszczanie-wodorowe',
    )
    expect(service && getRelatedServices(service)[0]?.id).toBe(
      'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem',
    )
  })

  it('does not create detail paths for online services', () => {
    const online = getPublicServiceBySlug(
      'trichology',
      'konsultacja-trychologiczna-online',
    )
    expect(online && getPublicServicePath(online)).toBeUndefined()
    expect(
      getDetailServiceBySlug('trichology', 'konsultacja-trychologiczna-online'),
    ).toBeUndefined()
  })

  it('publishes eye styling details under their own canonical path', () => {
    const service = getDetailServiceBySpecializationSlug(
      'eye-styling',
      'henna-brwi-z-regulacja',
    )
    expect(service && getPublicServicePath(service)).toBe(
      '/oprawa-oka/henna-brwi-z-regulacja',
    )
    expect(
      getDetailServiceBySpecializationSlug(
        'cosmetology',
        'henna-brwi-z-regulacja',
      ),
    ).toBeUndefined()
  })
})
