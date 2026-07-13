import { Section, SectionHeader } from '@components/ui'
import { effectsItems } from '@data/effects'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import { cn } from '@libs/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function EffectsGallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? effectsItems.length - 1 : prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === effectsItems.length - 1 ? 0 : prev + 1))
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    if (!isAutoPlay) return

    let interval: ReturnType<typeof setInterval>
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex((prev) =>
          prev === effectsItems.length - 1 ? 0 : prev + 1,
        )
      }, 5000)
    }, 5000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [isAutoPlay])

  return (
    <Section id="efekty" background="gray">
      <SectionHeader
        title="Efekty zabiegów"
        eyebrow="Przed i po"
        gradient
        className="mb-10 sm:mb-14"
      />

      <div className="relative mx-auto max-w-lg">
        <div className="relative">
          <div
            className="relative overflow-hidden rounded-lg border border-border-default bg-surface-strong shadow-subtle"
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          >
            <div className="aspect-3/4 overflow-hidden">
              <img
                key={effectsItems[currentIndex].id}
                src={webpFallbackSrc(effectsItems[currentIndex].src)}
                srcSet={webpSrcSet(
                  effectsItems[currentIndex].src,
                  MOBILE_WIDTHS,
                )}
                sizes={IMAGE_SIZES.effects}
                alt={effectsItems[currentIndex].alt}
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-20 min-h-11 min-w-11 -translate-y-1/2 rounded-md bg-surface/90 p-2 text-text-primary transition-colors duration-200 hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
              aria-label="Poprzedni efekt"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-20 min-h-11 min-w-11 -translate-y-1/2 rounded-md bg-surface/90 p-2 text-text-primary transition-colors duration-200 hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
              aria-label="Następny efekt"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              className="absolute bottom-0 left-0 right-0 bg-black/65 p-6 text-white z-10 pointer-events-none"
              aria-live="polite"
            >
              <h3 className="text-xl sm:text-2xl font-semibold mb-1 font-display">
                {effectsItems[currentIndex].title}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-1 mt-6">
          {effectsItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSlide(index)}
              className={cn(
                'w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action',
                index === currentIndex
                  ? 'text-action'
                  : 'text-text-muted hover:text-text-secondary',
              )}
              aria-label={`Przejdź do efektu ${index + 1}`}
              aria-current={index === currentIndex}
            >
              <span
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex ? 'w-8 bg-current' : 'w-2 bg-current',
                )}
              />
            </button>
          ))}
        </div>

        <div className="text-center mt-4 text-text-secondary">
          <p className="text-sm">
            {currentIndex + 1} / {effectsItems.length}
          </p>
        </div>
      </div>
    </Section>
  )
}
