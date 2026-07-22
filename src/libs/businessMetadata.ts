import type {
  BrandProfile,
  PublicService,
  SalonLocation,
} from '@app-types/types'
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
  logo: new URL(brand.logo.imagePath, brand.siteUrl).href,
  image: new URL('/images/gallery/witryna.webp', brand.siteUrl).href,
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

export const toServiceJsonLd = ({
  brand,
  service,
  path,
}: {
  brand: BrandProfile
  service: PublicService
  path: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': new URL(`${path}#service`, brand.siteUrl).href,
  name: service.name,
  description: service.shortDescription,
  url: new URL(path, brand.siteUrl).href,
  provider: {
    '@id': new URL('#beautysalon', brand.siteUrl).href,
    name: brand.name,
  },
})

export const toBreadcrumbListJsonLd = ({
  brand,
  items,
}: {
  brand: BrandProfile
  items: readonly { name: string; path: string }[]
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: new URL(item.path, brand.siteUrl).href,
  })),
})
