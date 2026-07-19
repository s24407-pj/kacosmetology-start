import { actionLinkStyles, Heading, surfaceCardStyles } from '@components/ui'
import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import BooksyLink from '@widgets/actions/BooksyLink'
import { ChevronDown, Heart, MapPin } from 'lucide-react'

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
            </div>

            <Heading level={1} variant="hero" className="mb-6">
              {brand.practitionerName}
            </Heading>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-action sm:text-base">
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
                className={actionLinkStyles({
                  variant: 'text',
                  className: 'cursor-pointer px-2',
                })}
              >
                Poznaj moje podejście
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md min-[810px]:max-w-none">
            <div
              className={surfaceCardStyles({
                className: 'relative overflow-hidden',
              })}
            >
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

            <div className="absolute -bottom-4 right-2 hidden rounded-md border border-border-default bg-surface px-4 py-2 shadow-subtle sm:block">
              <span className="font-body text-sm font-medium text-text-primary">
                Umów się online 24/7
              </span>
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
