import type { BusinessProfile, SalonLocation } from '@app-types/types'
import { describe, expect, it } from 'vitest'
import {
  brand,
  businessProfile,
  getPrimarySalonLocation,
  getSalonLocation,
  primarySalonLocation,
} from './business'

const withLocations = (
  locations: readonly SalonLocation[],
): BusinessProfile => ({ ...businessProfile, locations })

describe('business profile', () => {
  it('pins the current brand and primary salon facts', () => {
    expect(brand).toEqual({
      name: 'Ka.Cosmetology',
      practitionerName: 'Katarzyna Suwalska',
      practitionerNameGenitive: 'Katarzyny Suwalskiej',
      siteUrl: 'https://kacosmetology.pl/',
      email: 'gabinet@kacosmetology.pl',
      socialMedia: {
        instagram: 'https://www.instagram.com/ka.cosmetology',
        facebook: 'https://www.facebook.com/profile.php?id=61579179969990',
      },
      logo: {
        imagePath: '/images/logo.webp',
        imageAlt: 'Logotyp Ka.Cosmetology – monogram w odcieniach burgundu',
      },
      appShortName: 'KA',
    })
    expect(primarySalonLocation).toMatchObject({
      id: 'salon-starogard-gdanski',
      displayName: 'Ka.Cosmetology',
      phone: '+48 726 154 460',
      bookingUrl: 'https://kacosmetology.booksy.com',
      address: {
        streetAddress: 'ul. Paderewskiego 11a',
        postalCode: '83-200',
        locality: 'Starogard Gdański',
        countryCode: 'PL',
      },
      coordinates: {
        latitude: 53.898941431338294,
        longitude: 18.595858632430925,
      },
      areaServed: { type: 'City', name: 'Starogard Gdański' },
    })
  })

  it('uses one unique stable location ID and resolves the primary location', () => {
    const ids = businessProfile.locations.map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => /^salon-[a-z0-9-]+$/.test(id))).toBe(true)
    expect(getPrimarySalonLocation()).toBe(primarySalonLocation)
  })

  it('keeps public URLs HTTPS and coordinates finite', () => {
    const urls = [
      brand.siteUrl,
      brand.socialMedia.instagram,
      brand.socialMedia.facebook,
      primarySalonLocation.bookingUrl,
      primarySalonLocation.map.embedUrl,
    ]
    expect(urls.every((url) => url?.startsWith('https://'))).toBe(true)
    expect(Number.isFinite(primarySalonLocation.coordinates.latitude)).toBe(
      true,
    )
    expect(Number.isFinite(primarySalonLocation.coordinates.longitude)).toBe(
      true,
    )
  })

  it('rejects missing and duplicate location identities', () => {
    expect(() =>
      getSalonLocation(
        'salon-missing',
        withLocations(businessProfile.locations),
      ),
    ).toThrow(/found 0/)
    expect(() =>
      getSalonLocation(
        primarySalonLocation.id,
        withLocations([primarySalonLocation, primarySalonLocation]),
      ),
    ).toThrow(/found 2/)
  })
})
