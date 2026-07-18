import {
  Heading,
  iconActionStyles,
  Section,
  SectionHeader,
  surfaceCardStyles,
} from '@components/ui'
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
        className="mb-10 sm:mb-14"
      />

      <div className="relative mx-auto max-w-lg">
        <div className="relative">
          <div
            className={surfaceCardStyles({
              className: 'relative overflow-hidden bg-surface-strong',
            })}
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
              className={iconActionStyles({
                tone: 'overlay',
                size: 'lg',
                className: 'absolute left-4 top-1/2 z-20 -translate-y-1/2',
              })}
              aria-label="Poprzedni efekt"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className={iconActionStyles({
                tone: 'overlay',
                size: 'lg',
                className: 'absolute right-4 top-1/2 z-20 -translate-y-1/2',
              })}
              aria-label="Następny efekt"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              className="absolute bottom-0 left-0 right-0 bg-black/65 p-6 text-white z-10 pointer-events-none"
              aria-live="polite"
            >
              <Heading level={3} variant="card" tone="inverse">
                {effectsItems[currentIndex].title}
              </Heading>
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
