import { Section, SectionHeader } from '@components/ui'
import { ABOUT_SECTION } from '@data/about'
import { platformStats } from '@data/platformStats'
import { services } from '@data/services'
import { useCountUp } from '@hooks/useCountUp'
import { pluralizeOpinie } from '@libs/pluralize'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'

const totalReviews = platformStats.reduce((sum, stat) => sum + stat.count, 0)

const stats: Array<{
  value: number
  suffix: string
  decimals?: number
  label: string
}> = [
  {
    value: totalReviews,
    suffix: '+',
    label: `${pluralizeOpinie(totalReviews)} klientek`,
  },
  { value: 5, suffix: '.0', label: 'średnia ocen' },
  { value: services.length, suffix: '+', label: 'zabiegów w ofercie' },
]

function StatItem({
  value,
  suffix,
  decimals,
  label,
}: {
  value: number
  suffix: string
  decimals?: number
  label: string
}) {
  const [countRef, countDisplay] = useCountUp(value, 1400, decimals ?? 0)

  return (
    <div className="flex flex-col items-center text-center min-[810px]:items-start min-[810px]:text-left">
      <span className="font-display text-4xl font-bold text-action md:text-5xl">
        <span ref={countRef}>{countDisplay}</span>
        {suffix}
      </span>
      <span className="mt-1 font-body text-sm uppercase tracking-wider text-text-muted">
        {label}
      </span>
    </div>
  )
}

export default function AboutSection() {
  return (
    <Section id="o-mnie" background="white" decorated>
      <SectionHeader
        title="O mnie"
        eyebrow="Poznajmy się"
        gradient
        className="mb-12"
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 min-[810px]:grid-cols-2">
          <div className="order-1 min-[810px]:order-2">
            <div className="relative animate-on-scroll stagger-2">
              <span
                className="pointer-events-none absolute -left-2 -top-8 select-none font-display text-7xl leading-none text-action/10"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="border-l-2 border-action/30 pl-6 text-center font-body text-xl leading-relaxed text-text-secondary min-[810px]:text-left md:text-2xl">
                {ABOUT_SECTION.leadText}
              </p>
            </div>
          </div>

          <div className="relative order-2 min-[810px]:order-1 animate-on-scroll stagger-1">
            <div className="relative overflow-hidden rounded-lg border border-border-default bg-surface shadow-subtle">
              <div className="aspect-4/5 bg-surface-strong">
                <img
                  src={webpFallbackSrc(ABOUT_SECTION.image.src)}
                  srcSet={webpSrcSet(ABOUT_SECTION.image.src, MOBILE_WIDTHS)}
                  sizes={IMAGE_SIZES.aboutPortrait}
                  alt={ABOUT_SECTION.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 rounded-lg border border-border-default bg-surface px-6 py-8 shadow-subtle animate-on-scroll stagger-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </Section>
  )
}
