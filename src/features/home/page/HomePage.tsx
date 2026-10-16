import { brand, primarySalonLocation } from '@data/business'
import ContactSection from '@features/contact/sections/ContactSection'
import GoogleMap from '@features/contact/sections/GoogleMap'
import { toBeautySalonJsonLd, toWebPageJsonLd } from '@libs/businessMetadata'
import { JsonLd } from '@libs/JsonLd'
import { homeRouteMetadata } from '@libs/routeMetadata'
import { derivePublishedServicePriceRange } from '@libs/servicePricing'
import AboutSection from '../sections/AboutSection'
import HeroSection from '../sections/HeroSection'
import OpinionsSection from '../sections/OpinionsSection'
import ProcessSection from '../sections/ProcessSection'
import QuoteSection from '../sections/QuoteSection'
import SpecializationsSection from '../sections/SpecializationsSection'

const salonStructuredData = toBeautySalonJsonLd({
  brand,
  location: primarySalonLocation,
  priceRange: derivePublishedServicePriceRange(),
})

const webPageStructuredData = toWebPageJsonLd({
  brand,
  title: homeRouteMetadata.completeTitle,
  description: homeRouteMetadata.description,
  path: homeRouteMetadata.path,
  primaryImagePath: homeRouteMetadata.primaryImagePath,
})

export default function HomePage() {
  return (
    <>
      <JsonLd data={salonStructuredData} />
      <JsonLd data={webPageStructuredData} />
      <HeroSection />
      <SpecializationsSection />
      <AboutSection />
      <ProcessSection />
      <QuoteSection />
      <OpinionsSection />
      <ContactSection />
      <GoogleMap />
    </>
  )
}
