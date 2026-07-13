import ServicesSection from '@features/services/sections/ServicesSection'
import { useScrollDepthTracking } from '@hooks/useScrollDepthTracking'
import { useRouterState } from '@tanstack/react-router'
import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react'
import AboutSection from '../sections/AboutSection'
import HeroSection from '../sections/HeroSection'
import ProcessSection from '../sections/ProcessSection'
import QuoteSection from '../sections/QuoteSection'

const EffectsGallerySection = lazy(
  () => import('../sections/EffectsGallerySection'),
)
const GallerySection = lazy(() => import('../sections/GallerySection'))
const OpinionsSection = lazy(() => import('../sections/OpinionsSection'))
const ContactSection = lazy(
  () => import('@features/contact/sections/ContactSection'),
)
const GoogleMap = lazy(() => import('@features/contact/sections/GoogleMap'))

function LazySection({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

const DEFERRED_SECTION_IDS = ['efekty', 'galeria', 'opinie', 'kontakt'] as const

function useDeferredSections() {
  const hash = useRouterState({
    select: (state) => state.location.hash,
  })
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    if (DEFERRED_SECTION_IDS.some((sectionId) => hash === sectionId)) {
      setShouldMount(true)
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

      if (idleCallbackId !== undefined && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleCallbackId)
      }

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [shouldMount])

  return shouldMount
}

const HomePage = () => {
  useScrollDepthTracking()
  const shouldMountDeferredSections = useDeferredSections()

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <QuoteSection />
      <ServicesSection />
      {shouldMountDeferredSections && (
        <>
          <LazySection>
            <EffectsGallerySection />
          </LazySection>
          <LazySection>
            <GallerySection />
          </LazySection>
          <LazySection>
            <OpinionsSection />
          </LazySection>
          <LazySection>
            <ContactSection />
          </LazySection>
          <LazySection>
            <GoogleMap />
          </LazySection>
        </>
      )}
    </>
  )
}

export default HomePage
