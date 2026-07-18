import { Section, SectionHeader } from '@components/ui'
import { opinions } from '@data/opinions'
import { platformStats } from '@data/platformStats'
import { useCountUp } from '@hooks/useCountUp'
import { pluralizeOpinie } from '@libs/pluralize'
import { Star } from 'lucide-react'

function PlatformStat({ name, count }: { name: string; count: number }) {
  const [countRef, countDisplay] = useCountUp(count, 1400)

  return (
    <div className="flex flex-col items-center gap-2 px-5 py-7 text-center animate-on-scroll stagger-2 sm:px-8">
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
    <Section id="opinie" background="gray" decorated>
      <SectionHeader
        eyebrow="Zaufały mi klientki"
        title="Opinie"
        subtitle="Wasze słowa są najlepszą rekomendacją mojej pracy."
        gradient
      />

      <div className="mx-auto mb-14 grid max-w-3xl grid-cols-1 divide-y divide-border-default border-y border-border-default sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {platformStats.map((stat) => (
          <PlatformStat key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid border-y border-border-default lg:grid-cols-3 lg:divide-x lg:divide-border-default">
        {opinions.map((opinion, index) => (
          <article
            key={opinion.author + index.toString()}
            className="flex min-h-full flex-col justify-between border-b border-border-default px-2 py-8 animate-on-scroll last:border-b-0 sm:px-6 lg:border-b-0 lg:px-8"
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
            <footer className="mt-8 border-t border-action/20 pt-5">
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
    </Section>
  )
}
