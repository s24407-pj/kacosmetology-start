import { describe, expect, it } from 'vitest'
import { getServiceById, services } from './services'

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
})
