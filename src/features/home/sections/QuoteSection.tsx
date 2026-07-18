import { Section } from '@components/ui'
import {
  IMAGE_SIZES,
  VITRUVIAN_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'

const quote = 'Holistycznie znaczy czule.'
const vitruvianManSrc = '/images/vitruvian-man.webp'

export default function QuoteSection() {
  return (
    <Section background="accent" spacing="compact">
      <figure className="relative mx-auto max-w-4xl text-center animate-on-scroll">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <img
            src={webpFallbackSrc(vitruvianManSrc, 320)}
            srcSet={webpSrcSet(vitruvianManSrc, VITRUVIAN_WIDTHS)}
            sizes={IMAGE_SIZES.vitruvian}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-56 w-56 opacity-10 brightness-0 invert sm:h-64 sm:w-64 md:h-80 md:w-80"
          />
        </div>
        <blockquote className="relative">
          <p className="relative mx-auto max-w-3xl font-body text-2xl leading-relaxed text-white sm:text-3xl md:text-4xl">
            {quote}
          </p>
        </blockquote>
      </figure>
    </Section>
  )
}
