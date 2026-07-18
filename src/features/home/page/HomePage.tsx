import { brand, primarySalonLocation } from '@data/business'
import { useLegacyHashRedirect } from '@hooks/useLegacyHashRedirect'
import { useScrollDepthTracking } from '@hooks/useScrollDepthTracking'
import { toBeautySalonJsonLd } from '@libs/businessMetadata'
import { useRouterState } from '@tanstack/react-router'
import { lazy, useEffect, useState } from 'react'
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

const DEFERRED_SECTION_IDS = ['opinie', 'kontakt'] as const

function useDeferredSections() {
  const hash = useRouterState({
    select: (state) => state.location.hash,
  })
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    if (!DEFERRED_SECTION_IDS.some((sectionId) => hash === sectionId)) {
      return
    }

    setShouldMount(true)

    if (document.getElementById(hash)) {
      return
    }

    let timeoutId: number | undefined
    const observer = new MutationObserver(() => {
      const target = document.getElementById(hash)
      if (!target) {
        return
      }

      observer.disconnect()
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    observer.observe(document.body, { childList: true, subtree: true })
    timeoutId = window.setTimeout(() => observer.disconnect(), 10_000)

    return () => {
      observer.disconnect()
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [hash])

  useEffect(() => {
    if (shouldMount) {
      return
    }

    let timeoutId: number | undefined
    let idleCallbackId: number | undefined
    const mountSections = () => setShouldMount(true)
    const scheduleMount = () => {
      if (window.requestIdleCallback) {
        idleCallbackId = window.requestIdleCallback(mountSections, {
          timeout: 1500,
        })
        return
      }

      timeoutId = window.setTimeout(mountSections, 1)
    }

    if (document.readyState === 'complete') {
      scheduleMount()
    } else {
      window.addEventListener('load', scheduleMount, { once: true })
    }

    return () => {
      window.removeEventListener('load', scheduleMount)
      if (idleCallbackId !== undefined) {
        window.cancelIdleCallback?.(idleCallbackId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [shouldMount])

  return shouldMount
}

const structuredData = toBeautySalonJsonLd({
  brand,
  location: primarySalonLocation,
  priceRange: '30-550 PLN',
})

export default function HomePage() {
  useScrollDepthTracking()
  useLegacyHashRedirect()
  const shouldMountDeferredSections = useDeferredSections()
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
      {shouldMountDeferredSections ? (
        <>
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
                role="status"
                aria-label="Ładowanie mapy dojazdu"
              />
            }
          >
            <GoogleMap />
          </DeferredSectionBoundary>
        </>
      ) : null}
    </>
  )
}
