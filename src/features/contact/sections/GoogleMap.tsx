import { Section, SectionHeader, surfaceCardStyles } from '@components/ui'
import { brand, primarySalonLocation } from '@data/business'
import { useState } from 'react'

export default function GoogleMap() {
  const [mapLoaded, setMapLoaded] = useState(false)
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
        {!mapLoaded && (
          <div className="absolute inset-0 motion-safe:animate-pulse bg-surface-strong" />
        )}
        <iframe
          onLoad={() => setMapLoaded(true)}
          src={primarySalonLocation.map.embedUrl}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="h-80 w-full sm:h-96"
          title={`Lokalizacja gabinetu ${brand.name} w ${primarySalonLocation.localityLocative}`}
          loading="lazy"
        ></iframe>
      </div>
    </Section>
  )
}
