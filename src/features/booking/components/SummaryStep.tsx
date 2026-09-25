import { useCustomerAuth } from '@features/booking/hooks/useCustomerAuth'
import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
} from '@libs/scheduler/types'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'

interface SummaryStepProps {
  offering: PublicOffering
  employee: PublicEmployee
  date: string
  slot: AvailableSlot
  isSubmitting: boolean
  error: string | null
  onSubmit: () => Promise<void>
  onBack: () => void
}

export default function SummaryStep({
  offering,
  employee,
  date,
  slot,
  isSubmitting,
  error,
  onSubmit,
  onBack,
}: SummaryStepProps) {
  const { customer } = useCustomerAuth()
  const [consentAccepted, setConsentAccepted] = useState(true)

  const formattedDate = useMemo(() => {
    const [y, m, d] = date.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [date])

  const displayTime = slot.time.slice(0, 5)
  const hasDiscount = slot.price < slot.originalPrice

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
            Podsumowanie rezerwacji
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Sprawdź szczegóły swojej wizyty i zatwierdź rezerwację.
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Wróć</span>
        </button>
      </div>

      {error ? (
        <div
          className="flex items-center gap-3 rounded-lg bg-danger-500/10 p-4 text-sm text-danger-500 border border-danger-500/20"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-xs max-w-2xl space-y-6">
        {/* Reservation Receipt */}
        <div className="space-y-4 divide-y divide-border-default/60">
          {/* Service Details */}
          <div className="flex items-start justify-between gap-4 pt-1">
            <div>
              <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                Zabieg
              </span>
              <h3 className="font-display text-lg font-semibold text-text-primary mt-0.5">
                {offering.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Czas trwania: {offering.durationMinutes} minut</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                Cena
              </span>
              <div className="mt-0.5">
                {hasDiscount ? (
                  <div className="flex flex-col items-end">
                    <span className="line-through text-xs text-text-muted">
                      {slot.originalPrice}&nbsp;zł
                    </span>
                    <span className="text-xl font-bold text-action">
                      {slot.price}&nbsp;zł
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-action px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                      Rabat last minute
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-action">
                    {slot.price}&nbsp;zł
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Specialist */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-action">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                Specjalista
              </span>
              <p className="font-display text-base font-semibold text-text-primary">
                {employee.firstName} {employee.lastName || ''}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-action">
              <Calendar className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                Termin wizyty
              </span>
              <p className="font-display text-base font-semibold capitalize text-text-primary">
                {formattedDate}, godz. {displayTime}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-action">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                Miejsce
              </span>
              <p className="text-sm font-medium text-text-primary">
                Gabinet Ka.Cosmetology • ul. Paderewskiego 11a, Starogard
                Gdański
              </p>
            </div>
          </div>

          {/* Customer info */}
          {customer ? (
            <div className="pt-4 flex items-center justify-between text-xs text-text-secondary">
              <span>
                Klient:{' '}
                <strong>
                  {customer.firstName} {customer.lastName}
                </strong>
              </span>
              <span>
                Telefon do SMS: <strong>{customer.phoneNumber}</strong>
              </span>
            </div>
          ) : null}
        </div>

        {/* Consents & Terms */}
        <div className="border-t border-border-default pt-4 space-y-3">
          <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border-default text-action focus:ring-action cursor-pointer"
            />
            <span>
              Akceptuję regulamin salonu i zasady odwoływania wizyt.
              Potwierdzenie oraz przypomnienie o wizycie otrzymam wiadomością
              SMS.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={isSubmitting || !consentAccepted}
          onClick={onSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-action bg-action px-6 py-3 text-base font-semibold text-white hover:bg-action-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Tworzenie rezerwacji...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" aria-hidden="true" />
              <span>Potwierdzam rezerwację ({slot.price}&nbsp;zł)</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
