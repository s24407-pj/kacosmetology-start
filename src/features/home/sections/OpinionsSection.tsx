import { Heading, Section, Text } from '@components/ui'
import { opinions } from '@data/opinions'
import { platformStats } from '@data/platformStats'
import { useCountUp } from '@hooks/useCountUp'
import { pluralizeOpinie } from '@libs/pluralize'
import { cn } from '@libs/utils'
import { Quote, Star } from 'lucide-react'

function StatCard({ name, count }: { name: string; count: number }) {
  const [countRef, countDisplay] = useCountUp(count, 1400)

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-surface px-8 py-6 border border-border-default shadow-subtle animate-on-scroll stagger-2">
      <span className="text-sm font-semibold uppercase tracking-widest text-text-muted">
        {name}
      </span>
      <div className="flex items-end gap-2 mt-1">
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
        className="flex items-center gap-1 mt-1"
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
  const animationDelays = ['stagger-2', 'stagger-3', 'stagger-4'] as const

  return (
    <Section id="opinie" background="gray" decorated>
      <div className="text-center mb-16">
        <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-border-default bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-action animate-on-scroll">
          Zaufały mi klientki
        </span>
        <Heading gradient className="mb-6 animate-on-scroll">
          Opinie
        </Heading>
        <Text
          variant="lead"
          font="crimson"
          className="animate-on-scroll stagger-1"
        >
          Wasze słowa są najlepszą rekomendacją mojej pracy.
        </Text>
      </div>
      <div className="flex flex-wrap justify-center gap-6 mb-16">
        {platformStats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {opinions.map((opinion, index) => (
          <article
            key={opinion.author + index.toString()}
            className={cn(
              'group relative h-full rounded-lg bg-surface p-6 shadow-subtle border border-border-default transition-colors duration-200 hover:border-action/40 animate-on-scroll',
              animationDelays[index % animationDelays.length],
            )}
          >
            <Quote
              className="absolute -top-5 left-6 h-10 w-10 text-action/20 transition-colors duration-200 group-hover:text-action/30"
              aria-hidden="true"
            />
            <div className="flex h-full flex-col justify-between">
              <div>
                <div
                  className="mb-4 flex items-center gap-1"
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
                  „{opinion.content}"
                </p>
              </div>
              <footer className="mt-8 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-action font-display text-lg font-semibold text-white"
                  aria-hidden="true"
                >
                  {opinion.author.charAt(0)}
                </span>
                <div>
                  <p className="text-lg font-semibold text-action">
                    {opinion.author}
                  </p>
                  {opinion.service ? (
                    <p className="mt-0.5 text-sm text-text-muted">
                      {opinion.service}
                    </p>
                  ) : null}
                  {opinion.source ? (
                    <p className="mt-0.5 text-sm text-text-muted">
                      {opinion.source}
                    </p>
                  ) : null}
                </div>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
