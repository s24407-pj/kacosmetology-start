import { primarySalonLocation } from '@data/business'
import { ExternalLink, HelpCircle, Phone } from 'lucide-react'

export default function ReservationFallbackNotice() {
  return (
    <div className="rounded-lg border border-border-default bg-surface-muted/60 p-4 sm:p-5 text-sm text-text-secondary">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <HelpCircle
            className="h-5 w-5 text-action shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-text-primary">
              Wolisz umówić się telefonicznie lub przez Booksy?
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Jesteśmy do Twojej dyspozycji od poniedziałku do soboty.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <a
            href={`tel:${primarySalonLocation.phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-action" aria-hidden="true" />
            <span>{primarySalonLocation.phone}</span>
          </a>

          <a
            href={primarySalonLocation.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-action hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <span>Booksy</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}
