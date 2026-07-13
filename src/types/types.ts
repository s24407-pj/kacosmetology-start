export type ServiceCategory =
  | 'Oprawa oka'
  | 'Trychologia'
  | 'Kosmetologia'
  | 'Vouchery'
  | 'Promocje'
  | 'Online'

export interface PricePoint {
  value: number
  changedAt: string
}

export interface PriceHistoryEntry {
  serviceName: string
  history: PricePoint[]
}

export interface Service {
  name: string
  category: ServiceCategory
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

export interface Address {
  street: string
  city: string
  postalCode: string
}

export interface OpeningHours {
  [day: string]: string // e.g., "monday": "09:00 - 17:00"
}

export interface SocialMediaLinks {
  instagram: string
  facebook?: string
}

export interface Contact {
  phone: string
  email: string
  address: Address
  openingHours: OpeningHours
  socialMedia: SocialMediaLinks
  booksy: string
}

export type ContactLinkType = 'phone' | 'email' | 'instagram' | 'facebook'

export interface ContactLinkData {
  type: ContactLinkType
  label: string
  text: string
  value: string
  external?: boolean
}

export type BottomNavItemId = 'zabiegi' | 'efekty' | 'opinie' | 'kontakt'

export interface BottomNavItemData {
  id: BottomNavItemId
  label: string
}

export type MainNavItemId = 'hero' | 'o-mnie' | 'galeria' | BottomNavItemId

export interface MainNavItemData {
  id: MainNavItemId
  label: string
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
  activeSection: string
  setActiveSection: (id: string) => void
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  scrolled: boolean
  showScrollToTop: boolean
  showStickyBookCTA: boolean
}
