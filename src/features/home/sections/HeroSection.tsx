import { contact } from '@data/contact'
import { platformStats } from '@data/platformStats'
import { useSectionNavigation } from '@hooks/useSectionNavigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { pluralizeOpinie } from '@libs/pluralize'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import {
  ChevronDown,
  GraduationCap,
  Heart,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react'

const totalReviews = platformStats.reduce((sum, stat) => sum + stat.count, 0)

export default function HeroSection() {
  const navigateToSection = useSectionNavigation()

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-surface-muted pt-28 pb-12 md:pt-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 py-10 min-[810px]:grid-cols-[1fr_0.82fr] min-[810px]:py-14">
          <div className="text-left">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-md border border-border-default bg-surface px-3 py-2">
                <MapPin className="h-5 w-5 text-action" />
                <span className="font-body text-lg font-medium text-action">
                  Starogard Gdański
                </span>
              </span>
            </div>

            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-text-primary md:text-7xl">
              Katarzyna Suwalska
            </h1>

            <p className="mb-8 max-w-2xl font-body text-xl leading-relaxed text-text-secondary md:text-2xl">
              Holistyczna kosmetologia i trychologia dopasowana do Ciebie.
            </p>

            <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="inline-flex items-center gap-2">
                <span className="flex" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </span>
                <span className="font-body text-sm text-text-secondary">
                  5.0 ({totalReviews} {pluralizeOpinie(totalReviews)})
                </span>
              </span>
              <span className="inline-flex items-center gap-2 font-body text-sm text-text-secondary">
                <GraduationCap className="h-5 w-5 text-action" />
                magister kosmetologii
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={contact.booksy}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-action px-6 py-3 font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
                onClick={() =>
                  trackPlausibleEvent('CTA Booksy Click', { placement: 'hero' })
                }
              >
                <Heart className="mr-2 h-5 w-5" />
                Umów wizytę
              </a>

              <button
                type="button"
                onClick={() => {
                  trackPlausibleEvent('Secondary CTA Click', {
                    placement: 'hero',
                    target: 'o-mnie',
                  })
                  void navigateToSection('o-mnie')
                }}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-border-default bg-surface px-6 py-3 font-semibold text-action transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Poznaj mnie
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md min-[810px]:max-w-none">
            <div className="relative overflow-hidden rounded-lg border border-border-default bg-surface shadow-subtle">
              <div className="aspect-4/5 bg-surface-strong">
                <img
                  src={webpFallbackSrc('/images/hero.webp')}
                  srcSet={webpSrcSet('/images/hero.webp', MOBILE_WIDTHS)}
                  sizes={IMAGE_SIZES.hero}
                  alt="Katarzyna Suwalska"
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
          onClick={(event) => {
            event.preventDefault()
            void navigateToSection('o-mnie')
          }}
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
