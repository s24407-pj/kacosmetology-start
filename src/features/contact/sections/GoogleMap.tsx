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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d146965.76001793574!2d18.595858632430925!3d53.898941431338294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47029ddcdf06e639%3A0x22e7786a8b623b1a!2sKa.Cosmetology%20Kosmetolog%20%7C%20Trycholog!5e0!3m2!1spl!2spl!4v1757628479347!5m2!1spl!2spl"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="w-full h-96"
          title="Lokalizacja gabinetu Ka.Cosmetology w Starogardzie Gdańskim"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  )
}
