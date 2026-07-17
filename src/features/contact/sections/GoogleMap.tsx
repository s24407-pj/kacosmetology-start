import { brand, primarySalonLocation } from '@data/business'
import { useState } from 'react'

export default function GoogleMap() {
  const [mapLoaded, setMapLoaded] = useState(false)
  return (
    <div className="bg-surface-muted px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-lg border border-border-default shadow-subtle">
        {!mapLoaded && (
          <div className="absolute inset-0 animate-pulse bg-surface-strong" />
        )}
        <iframe
          onLoad={() => setMapLoaded(true)}
          src={primarySalonLocation.map.embedUrl}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="w-full h-96"
          title={`Lokalizacja gabinetu ${brand.name} w ${primarySalonLocation.localityLocative}`}
          loading="lazy"
        ></iframe>
      </div>
    </div>
  )
}
