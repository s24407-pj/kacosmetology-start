import { brand, primarySalonLocation } from '@data/business'
import ContactSection from '@features/contact/sections/ContactSection'
import GoogleMap from '@features/contact/sections/GoogleMap'
import { toBeautySalonJsonLd } from '@libs/businessMetadata'
import AboutSection from '../sections/AboutSection'
import HeroSection from '../sections/HeroSection'
import OpinionsSection from '../sections/OpinionsSection'
import ProcessSection from '../sections/ProcessSection'
import QuoteSection from '../sections/QuoteSection'
import SpecializationsSection from '../sections/SpecializationsSection'

const structuredData = toBeautySalonJsonLd({
  brand,
  location: primarySalonLocation,
  priceRange: '30-550 PLN',
})

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from canonical, repository-controlled data.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
