import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import BooksyLink from '@widgets/actions/BooksyLink'
import { ChevronDown, GraduationCap, Heart, MapPin } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-surface-muted pb-12 pt-40 min-[810px]:pb-16 min-[810px]:pt-36"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 py-6 min-[810px]:grid-cols-[1fr_0.82fr] min-[810px]:gap-16 min-[810px]:py-12">
          <div className="text-left">
            <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-action" aria-hidden="true" />
                {primarySalonLocation.address.locality}
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap
                  className="h-4 w-4 text-action"
                  aria-hidden="true"
                />
                magister kosmetologii
              </span>
            </div>

            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-text-primary md:text-7xl">
              {brand.practitionerName}
            </h1>

            <p className="mb-3 font-body text-lg font-semibold uppercase tracking-[0.12em] text-action sm:text-xl">
              Kosmetologia · Trychologia · Oprawa oka
            </p>
            <p className="mb-8 max-w-xl font-body text-xl leading-relaxed text-text-secondary md:text-2xl">
              Holistyczna kosmetologia i trychologia dopasowana do Ciebie.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <BooksyLink placement="hero" showExternalIcon={false}>
                <Heart className="mr-2 h-5 w-5" />
                Umów wizytę
              </BooksyLink>

              <a
                href="#o-mnie"
                onClick={() => {
                  trackPlausibleEvent('Secondary CTA Click', {
                    placement: 'hero',
                    target: 'o-mnie',
                  })
                }}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center px-2 py-3 font-semibold text-action underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
              >
                Poznaj moje podejście
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md min-[810px]:max-w-none">
            <div className="relative overflow-hidden rounded-lg border border-border-default bg-surface">
              <div className="aspect-4/5 bg-surface-strong">
                <img
                  src={webpFallbackSrc('/images/hero.webp')}
                  srcSet={webpSrcSet('/images/hero.webp', MOBILE_WIDTHS)}
                  sizes={IMAGE_SIZES.hero}
                  alt={brand.practitionerName}
                  className="h-full w-full object-cover object-bottom"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>

        <a
          href="#o-mnie"
          className="mx-auto hidden w-fit flex-col items-center gap-1 text-text-muted transition-colors hover:text-action min-[810px]:flex"
          aria-label="Przewiń w dół"
        >
          <span className="font-body text-xs uppercase tracking-wider">
            Przewiń
          </span>
          <ChevronDown
            className="animate-scroll-cue h-5 w-5"
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  )
}
