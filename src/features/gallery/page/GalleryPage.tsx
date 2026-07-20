import { PageHero } from '@components/ui'
import { DeferredSectionBoundary } from '@features/home/components/DeferredSectionBoundary'
import { lazy, Suspense } from 'react'

const EffectsGallerySection = lazy(
  () => import('@features/home/sections/EffectsGallerySection'),
)
const GallerySection = lazy(
  () => import('@features/home/sections/GallerySection'),
)

export default function GalleryPage() {
  return (
    <>
      <PageHero
        align="center"
        maxWidth="medium"
        eyebrow="Efekty i wnętrze"
        title="Galeria"
        description="Zobacz efekty zabiegów oraz wnętrze gabinetu Ka.Cosmetology."
      />
      <Suspense
        fallback={
          <div role="status" aria-live="polite" className="min-h-80">
            Ładowanie galerii
          </div>
        }
      >
        <DeferredSectionBoundary
          sectionId="efekty"
          sectionLabel="Efekty zabiegów"
          background="gray"
        >
          <EffectsGallerySection />
        </DeferredSectionBoundary>
        <DeferredSectionBoundary
          sectionId="gabinet"
          sectionLabel="Gabinet"
          background="white"
        >
          <GallerySection />
        </DeferredSectionBoundary>
      </Suspense>
    </>
  )
}
