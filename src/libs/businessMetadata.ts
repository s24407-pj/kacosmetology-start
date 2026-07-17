import type { BrandProfile, SalonLocation } from '@app-types/types'
import { toSchemaOrgOpeningHoursSpecifications } from './openingHours'

type BeautySalonJsonLdInput = {
  brand: BrandProfile
  location: SalonLocation
  priceRange: string
}

export const toBeautySalonJsonLd = ({
  brand,
  location,
  priceRange,
}: BeautySalonJsonLdInput) => ({
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  '@id': new URL('#beautysalon', brand.siteUrl).href,
  name: brand.name,
  image: new URL(brand.logo.imagePath, brand.siteUrl).href,
  url: new URL('/', brand.siteUrl).href,
  telephone: location.phone,
  email: brand.email,
  priceRange,
  address: {
    '@type': 'PostalAddress',
    streetAddress: location.address.streetAddress,
    postalCode: location.address.postalCode,
    addressLocality: location.address.locality,
    addressCountry: location.address.countryCode,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: location.coordinates.latitude,
    longitude: location.coordinates.longitude,
  },
  areaServed: {
    '@type': location.areaServed.type,
    name: location.areaServed.name,
  },
  hasMap: location.map.embedUrl,
  openingHoursSpecification: toSchemaOrgOpeningHoursSpecifications(
    location.openingSchedule,
  ),
  sameAs: [
    location.bookingUrl,
    brand.socialMedia.instagram,
    ...(brand.socialMedia.facebook ? [brand.socialMedia.facebook] : []),
  ],
})
