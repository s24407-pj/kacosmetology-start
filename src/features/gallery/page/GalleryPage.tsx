import { PageHero } from '@components/ui'
import EffectsGallerySection from '@features/home/sections/EffectsGallerySection'
import GallerySection from '@features/home/sections/GallerySection'

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
      <EffectsGallerySection />
      <GallerySection />
    </>
  )
}
