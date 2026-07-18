import { Section, SectionHeader } from '@components/ui'
import { specializations } from '@data/specializations'
import { trackPlausibleEvent } from '@libs/analytics'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import { Link } from '@tanstack/react-router'

const specializationImages = {
  cosmetology: {
    src: '/images/specialization-cards/cosmetology.webp',
    width: 1600,
    height: 1067,
    position: 'object-[35%_center]',
  },
  'eye-styling': {
    src: '/images/specialization-cards/eye-styling.webp',
    width: 1080,
    height: 1631,
    position: 'object-[50%_42%] md:object-[50%_20%] lg:object-[50%_42%]',
  },
  trichology: {
    src: '/images/specialization-cards/trichology.webp',
    width: 1080,
    height: 720,
    position: 'object-[58%_center]',
  },
} as const

export default function SpecializationsSection() {
  return (
    <Section background="gray">
      <SectionHeader
        title="Trzy obszary. Jedno uważne podejście."
        eyebrow="Wybierz obszar"
      />
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
        {specializations.map((item) => {
          const image = specializationImages[item.id]

          return (
            <Link
              key={item.id}
              to={item.path}
              aria-label={`Poznaj ofertę — ${item.name}`}
              onClick={() =>
                trackPlausibleEvent('Specialization Click', {
                  area: item.area,
                  placement: 'home',
                  target: item.id,
                })
              }
              className="group relative isolate flex h-[28rem] overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white sm:h-[30rem] md:h-[32rem] lg:h-[36rem]"
            >
              <img
                src={webpFallbackSrc(image.src)}
                srcSet={webpSrcSet(image.src, MOBILE_WIDTHS)}
                sizes={IMAGE_SIZES.specializationCard}
                width={image.width}
                height={image.height}
                alt=""
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover ${image.position} motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.025]`}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-brand/25 transition-colors duration-300 group-hover:bg-brand/35 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-darker/95 via-brand-darker/35 via-55% to-transparent"
              />
              <span className="relative mt-auto flex w-full flex-col p-6 text-white sm:p-8 lg:p-7">
                <span className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                  {item.name}
                </span>
                <span className="mt-3 text-lg leading-relaxed text-white/90">
                  {item.description}
                </span>
                <span className="mt-6 w-fit border-b border-white/70 pb-1 text-sm font-semibold uppercase tracking-[0.12em]">
                  Poznaj ofertę
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
