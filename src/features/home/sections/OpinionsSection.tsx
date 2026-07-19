import { Section, SectionHeader } from '@components/ui'
import { opinions } from '@data/opinions'
import { platformStats } from '@data/platformStats'
import { useCountUp } from '@hooks/useCountUp'
import { pluralizeOpinie } from '@libs/pluralize'
import { Star } from 'lucide-react'

function PlatformStat({
  name,
  count,
  delay,
}: {
  name: string
  count: number
  delay: string
}) {
  const [countRef, countDisplay] = useCountUp(count, 1400)

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-lg bg-surface px-5 py-8 text-center shadow-subtle sm:px-8"
      data-reveal-on-scroll
      data-reveal-variant="scale"
      data-reveal-delay={delay}
    >
      <span className="text-sm font-semibold uppercase tracking-widest text-text-muted">
        {name}
      </span>
      <div className="mt-1 flex items-end gap-2">
        <span
          ref={countRef}
          className="text-5xl font-bold leading-none text-action"
        >
          {countDisplay}
        </span>
        <span className="text-lg text-text-muted mb-1">
          {pluralizeOpinie(count)}
        </span>
      </div>
      <div
        className="mt-1 flex items-center gap-1"
        role="img"
        aria-label="Ocena: 5 gwiazdek"
      >
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <Star
            key={n}
            className="w-5 h-5 fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
        ))}
        <span className="ml-2 text-xl font-semibold text-text-primary">
          5.0
        </span>
      </div>
    </div>
  )
}

export default function OpinionsSection() {
  return (
    <Section id="opinie" background="gray">
      <SectionHeader
        eyebrow="Zaufały mi klientki"
        title="Opinie"
        subtitle="Wasze słowa są najlepszą rekomendacją mojej pracy."
      />

      <div className="mx-auto mb-14 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {platformStats.map((stat, index) => (
          <PlatformStat key={stat.name} {...stat} delay={index.toString()} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {opinions.map((opinion, index) => (
          <article
            key={opinion.author + index.toString()}
            className="flex min-h-full flex-col justify-between rounded-lg bg-surface p-6 shadow-subtle transition-[transform,box-shadow] duration-400 ease-out hover:-translate-y-1 hover:shadow-raised motion-reduce:transform-none motion-reduce:transition-none sm:p-8"
            data-reveal-on-scroll
            data-reveal-variant="scale"
            data-reveal-delay={index.toString()}
          >
            <div>
              <div
                className="mb-5 flex items-center gap-1"
                role="img"
                aria-label="Ocena: 5 gwiazdek"
              >
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <Star
                    key={n}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="font-body text-lg italic leading-relaxed text-text-secondary">
                „{opinion.content}”
              </p>
            </div>
            <footer className="mt-8 pt-1">
              <p className="font-semibold text-action">{opinion.author}</p>
              {opinion.service ? (
                <p className="mt-1 text-sm text-text-muted">
                  {opinion.service}
                </p>
              ) : null}
              {opinion.source ? (
                <p className="mt-1 text-sm text-text-muted">{opinion.source}</p>
              ) : null}
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-end sm:mt-10">
        <div
          className="opinions-signature flex items-center gap-3 text-action"
          data-reveal-on-scroll
        >
          <span className="font-body text-2xl italic sm:text-3xl">
            Dziękuję
          </span>
          <svg
            className="h-12 w-14"
            viewBox="0 0 64 56"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="opinions-heart-path"
              d="M32 50C27 44 8 32 8 18.5C8 10.5 13 6 19.5 6C25 6 29 9.5 32 14C35 9.5 39 6 44.5 6C51 6 56 10.5 56 18.5C56 32 37 44 32 50Z"
              pathLength="100"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Section>
  )
}
