import type { OpeningSchedule } from './openingHours'

export type ServiceCatalogCategory =
  | 'Oprawa oka'
  | 'Trychologia'
  | 'Kosmetologia'
  | 'Online'

export type ServiceId = `service-${string}`
export type ServiceArea = 'cosmetology' | 'trichology'
export type ServiceSpecializationId =
  | 'cosmetology'
  | 'eye-styling'
  | 'trichology'
export type ServiceCategory =
  | 'cosmetology'
  | 'eye-styling'
  | 'trichology'
  | 'online'

export interface PricePoint {
  value: number
  changedAt: string
}

export interface PriceHistoryEntry {
  serviceId: ServiceId
  history: PricePoint[]
}

export interface Service {
  id: ServiceId
  name: string
  catalogCategory: ServiceCatalogCategory
  price: number // zł
  duration: number // min
  isNext: boolean
  description: string
  forWho?: string
  note?: string
  includes?: string[]
  effects?: string[]
  preparation?: string[]
  recommendedTests?: string[]
  contraindications?: string[] | string
}

export interface PublicService extends Service {
  slug: string
  area: ServiceArea
  category: ServiceCategory
  shortDescription: string
  requiresPriorConsultation: boolean
  isPublished: boolean
  hasDetailPage: boolean
  featured: boolean
  relatedServiceIds: ServiceId[]
}

export type ServiceSource = Service

export type SalonLocationId = `salon-${string}`
export type HttpsUrl = `https://${string}`

export interface BrandProfile {
  name: string
  practitionerName: string
  practitionerNameGenitive: string
  siteUrl: HttpsUrl
  email: string
  socialMedia: {
    instagram: HttpsUrl
    facebook?: HttpsUrl
  }
  logo: {
    imagePath: `/${string}`
    imageAlt: string
  }
  appShortName: string
}

export interface PostalAddress {
  streetAddress: string
  postalCode: string
  locality: string
  countryCode: string
}

export interface GeoCoordinates {
  latitude: number
  longitude: number
}

export interface SalonLocation {
  id: SalonLocationId
  displayName: string
  localityLocative: string
  phone: string
  bookingUrl: HttpsUrl
  address: PostalAddress
  coordinates: GeoCoordinates
  map: { embedUrl: HttpsUrl }
  areaServed: { type: 'City'; name: string }
  openingSchedule: OpeningSchedule
}

export interface BusinessProfile {
  brand: BrandProfile
  primaryLocationId: SalonLocationId
  locations: readonly SalonLocation[]
}

export type ContactLinkType = 'phone' | 'email' | 'instagram' | 'facebook'

export interface ContactLinkData {
  type: ContactLinkType
  label: string
  text: string
  value: string
  external?: boolean
}

export type PublicRoutePath =
  | '/'
  | '/kosmetologia'
  | '/oprawa-oka'
  | '/trychologia'
  | '/galeria'
  | '/rezerwacja'

export type BottomNavItemId =
  | 'kosmetologia'
  | 'trychologia'
  | 'oprawa-oka'
  | 'galeria'
  | 'kontakt'

export interface BottomNavItemData {
  id: BottomNavItemId
  label: string
  to: PublicRoutePath
  hash?: string
}

export type MainNavItemId =
  | 'start'
  | 'kosmetologia'
  | 'oprawa-oka'
  | 'trychologia'
  | 'o-mnie'
  | 'galeria'
  | 'opinie'
  | 'kontakt'

export interface MainNavItemData {
  id: MainNavItemId
  label: string
  to: PublicRoutePath
  hash?: string
}

export interface Opinion {
  author: string
  content: string
  service?: string
  source?: string
}

export interface PlatformStat {
  name: string
  count: number
}

export type AboutProcessStepIcon =
  | 'clipboard'
  | 'sparkles'
  | 'checklist'
  | 'refresh'

export interface AboutImage {
  src: string
  alt: string
  aspect?: '16/10' | '4/5' | '9/16'
}

export interface AboutProcessStep {
  step: number
  title: string
  description: string
  icon: AboutProcessStepIcon
  image?: AboutImage
  video?: AboutVideo
}

export interface AboutVideo {
  poster: string
  alt: string
  sources: {
    webm: string
    mp4: string
  }
}

export interface AboutSection {
  leadText: string
  processHeading: string
  processSteps: AboutProcessStep[]
  image: AboutImage
}

export interface UIContextType {
  /** @deprecated Route state replaces section observation. */
  activeSection?: string
  /** @deprecated Route state replaces section observation. */
  setActiveSection?: (id: string) => void
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  scrolled: boolean
  showScrollToTop: boolean
}
