import { brand, primarySalonLocation } from '@data/business'
import { toSchemaOrgOpeningHoursSpecifications } from '@libs/openingHours'
import { describe, expect, it } from 'vitest'
import { toBeautySalonJsonLd } from './businessMetadata'

describe('toBeautySalonJsonLd', () => {
  it('projects the complete current BeautySalon representation', () => {
    expect(
      toBeautySalonJsonLd({
        brand,
        location: primarySalonLocation,
        priceRange: '30-550 PLN',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      '@id': 'https://kacosmetology.pl/#beautysalon',
      name: brand.name,
      logo: 'https://kacosmetology.pl/images/logo.webp',
      image: 'https://kacosmetology.pl/images/gallery/witryna.webp',
      url: brand.siteUrl,
      telephone: primarySalonLocation.phone,
      email: brand.email,
      priceRange: '30-550 PLN',
      address: {
        '@type': 'PostalAddress',
        streetAddress: primarySalonLocation.address.streetAddress,
        postalCode: primarySalonLocation.address.postalCode,
        addressLocality: primarySalonLocation.address.locality,
        addressCountry: primarySalonLocation.address.countryCode,
      },
      geo: {
        '@type': 'GeoCoordinates',
        ...primarySalonLocation.coordinates,
      },
      areaServed: {
        '@type': 'City',
        name: primarySalonLocation.areaServed.name,
      },
      hasMap: primarySalonLocation.map.embedUrl,
      openingHoursSpecification: toSchemaOrgOpeningHoursSpecifications(
        primarySalonLocation.openingSchedule,
      ),
      sameAs: [
        primarySalonLocation.bookingUrl,
        brand.socialMedia.instagram,
        brand.socialMedia.facebook,
      ],
    })
  })

  it('reads changed inputs and preserves explicit service area', () => {
    const changed = {
      ...primarySalonLocation,
      phone: '+48 000 000 000',
      address: {
        ...primarySalonLocation.address,
        streetAddress: 'Inna 1',
        locality: 'Inna miejscowość',
      },
      map: { embedUrl: 'https://maps.example.com/embed' as const },
      areaServed: { type: 'City' as const, name: 'Osobny obszar' },
    }
    const jsonLd = toBeautySalonJsonLd({
      brand: {
        ...brand,
        socialMedia: { instagram: brand.socialMedia.instagram },
      },
      location: changed,
      priceRange: 'route-owned',
    })
    expect(jsonLd.telephone).toBe(changed.phone)
    expect(jsonLd.address.streetAddress).toBe(changed.address.streetAddress)
    expect(jsonLd.hasMap).toBe(changed.map.embedUrl)
    expect(jsonLd.areaServed.name).toBe('Osobny obszar')
    expect(jsonLd.address.addressLocality).toBe('Inna miejscowość')
    expect(jsonLd.priceRange).toBe('route-owned')
    expect(jsonLd.sameAs).not.toContain(brand.socialMedia.facebook)
  })
})
