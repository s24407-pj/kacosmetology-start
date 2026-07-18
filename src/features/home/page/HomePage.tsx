import { brand, primarySalonLocation } from '@data/business'
import { useLegacyHashRedirect } from '@hooks/useLegacyHashRedirect'
import { useScrollDepthTracking } from '@hooks/useScrollDepthTracking'
import { toBeautySalonJsonLd } from '@libs/businessMetadata'
import { lazy, Suspense } from 'react'
import { DeferredSectionBoundary } from '../components/DeferredSectionBoundary'
import AboutSection from '../sections/AboutSection'
import HeroSection from '../sections/HeroSection'
import ProcessSection from '../sections/ProcessSection'
import QuoteSection from '../sections/QuoteSection'
import SpecializationsSection from '../sections/SpecializationsSection'

const OpinionsSection = lazy(() => import('../sections/OpinionsSection'))
const ContactSection = lazy(
  () => import('@features/contact/sections/ContactSection'),
)
const GoogleMap = lazy(() => import('@features/contact/sections/GoogleMap'))

const structuredData = toBeautySalonJsonLd({
  brand,
  location: primarySalonLocation,
  priceRange: '30-550 PLN',
})

export default function HomePage() {
  useScrollDepthTracking()
  useLegacyHashRedirect()
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
      <Suspense fallback={null}>
        <DeferredSectionBoundary
          sectionId="opinie"
          sectionLabel="Opinie"
          background="gray"
        >
          <OpinionsSection />
        </DeferredSectionBoundary>
        <DeferredSectionBoundary
          sectionId="kontakt"
          sectionLabel="Kontakt"
          background="contact"
        >
          <ContactSection />
        </DeferredSectionBoundary>
        <DeferredSectionBoundary
          sectionLabel="Mapa dojazdu"
          background="gray"
          loadingFallback={
            <div
              className="min-h-96 bg-surface-muted"
              aria-label="Ładowanie mapy dojazdu"
            />
          }
        >
          <GoogleMap />
        </DeferredSectionBoundary>
      </Suspense>
    </>
  )
}
