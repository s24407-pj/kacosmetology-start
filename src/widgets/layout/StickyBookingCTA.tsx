import { useUI } from '@context/UIContext'
import { primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn } from '@libs/utils'
import { Calendar } from 'lucide-react'

export default function StickyBookingCTA() {
  const { showStickyBookCTA: show } = useUI()

  return (
    <div
      aria-hidden={!show}
      className={cn(
        'fixed bottom-18 min-[810px]:bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out',
        show
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <a
        href={primarySalonLocation.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={show ? undefined : -1}
        onClick={() =>
          trackPlausibleEvent('CTA Booksy Click', {
            placement: 'sticky-cta',
          })
        }
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-action px-6 py-3 text-sm font-semibold text-white shadow-subtle transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
      >
        <Calendar className="h-4 w-4" />
        Umów się
      </a>
    </div>
  )
}
