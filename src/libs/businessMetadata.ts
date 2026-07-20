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

export const toBlogPostingJsonLd = ({
  brand,
  post,
  path,
}: {
  brand: BrandProfile
  post: {
    title: string
    excerpt: string
    publishedAt: string
    updatedAt?: string
    category: { label: string }
    tags: readonly { label: string }[]
    coverImage?: { src: string; alt: string }
    seo?: { description?: string }
  }
  path: string
}) => {
  const url = new URL(path, brand.siteUrl).href
  const image = post.coverImage
    ? new URL(post.coverImage.src, brand.siteUrl).href
    : new URL(brand.logo.imagePath, brand.siteUrl).href

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': new URL(`${path}#article`, brand.siteUrl).href,
    headline: post.title,
    description: post.seo?.description ?? post.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    articleSection: post.category.label,
    keywords: post.tags.map((tag) => tag.label).join(', '),
    image,
    author: {
      '@type': 'Person',
      name: brand.practitionerName,
    },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: {
        '@type': 'ImageObject',
        url: new URL(brand.logo.imagePath, brand.siteUrl).href,
      },
    },
  }
}

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
