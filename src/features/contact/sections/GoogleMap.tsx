import { Section, SectionHeader, surfaceCardStyles } from '@components/ui'
import { brand, primarySalonLocation } from '@data/business'

export default function GoogleMap() {
  return (
    <Section background="gray" decorated="top">
      <SectionHeader
        eyebrow="Dojazd"
        title="Znajdź gabinet"
        subtitle="Sprawdź lokalizację i zaplanuj wygodny dojazd."
      />
      <div
        className={surfaceCardStyles({
          className: 'relative mx-auto max-w-6xl overflow-hidden',
        })}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 motion-safe:animate-pulse bg-surface-strong"
        />
        <iframe
          src={primarySalonLocation.map.embedUrl}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="relative block h-80 w-full sm:h-96"
          title={`Lokalizacja gabinetu ${brand.name} w ${primarySalonLocation.localityLocative}`}
          loading="lazy"
        ></iframe>
      </div>
    </Section>
  )
}
