import type { ServiceSpecializationId } from '@app-types/types'
import { Eyebrow, Heading, Text } from '@components/ui'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

const imageLayouts: Record<ServiceSpecializationId, { position: string }> = {
  cosmetology: {
    position: 'object-[58%_32%]',
  },
  'eye-styling': {
    position: 'object-[50%_45%]',
  },
  trichology: {
    position: 'object-[48%_42%]',
  },
}

type SpecializationHeroProps = {
  specializationId: ServiceSpecializationId
  eyebrow: string
  title: string
  description: string
  image: {
    src: string
    alt: string
  }
  actions: ReactNode
}

export function SpecializationHero({
  specializationId,
  eyebrow,
  title,
  description,
  image,
  actions,
}: SpecializationHeroProps) {
  const layout = imageLayouts[specializationId]

  return (
    <section className="relative isolate flex min-h-[70vh] overflow-hidden border-b border-border-default lg:min-h-[82vh]">
      <img
        src={webpFallbackSrc(image.src)}
        srcSet={webpSrcSet(image.src, MOBILE_WIDTHS)}
        sizes={IMAGE_SIZES.specializationHero}
        alt={image.alt}
        width={1080}
        height={810}
        loading="eager"
        decoding="async"
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          layout.position,
        )}
      />
      <span aria-hidden="true" className="absolute inset-0 bg-brand/25" />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-darker/95 via-brand-darker/40 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-14 pt-52 sm:px-6 sm:pb-16 min-[810px]:pt-40">
        <div
          className="max-w-2xl"
          data-reveal-on-scroll
          data-reveal-variant="scale"
        >
          <Eyebrow tone="inverse" className="mb-3">
            {eyebrow}
          </Eyebrow>
          <Heading level={1} variant="page" tone="inverse">
            {title}
          </Heading>
          <Text
            variant="lead"
            font="crimson"
            className="mt-6 max-w-xl leading-relaxed text-white/90"
          >
            {description}
          </Text>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </section>
  )
}
