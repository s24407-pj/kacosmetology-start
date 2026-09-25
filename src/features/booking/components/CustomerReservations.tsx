import { useCustomerAuth } from '@features/booking/hooks/useCustomerAuth'
import { cancelReservation, fetchMyReservations } from '@libs/scheduler/api'
import type {
  PublicOffering,
  ReservationResponse,
  ReservationStatus,
} from '@libs/scheduler/types'
import { cn } from '@libs/utils'
import {
  AlertTriangle,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AuthStep from './AuthStep'

interface CustomerReservationsProps {
  offerings: PublicOffering[]
  onNewBooking: () => void
}

const STATUS_LABELS: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  CONFIRMED: {
    label: 'Potwierdzona',
    className: 'bg-success-500/10 text-success-500 border-success-500/20',
  },
  PENDING: {
    label: 'Oczekująca',
    className: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
  },
  COMPLETED: {
    label: 'Zrealizowana',
    className: 'bg-surface-muted text-text-muted border-border-default',
  },
  CANCELLED: {
    label: 'Odwołana',
    className: 'bg-danger-500/10 text-danger-500 border-danger-500/20',
  },
  NO_SHOW: {
    label: 'Nieobecność',
    className: 'bg-surface-muted text-text-muted border-border-default',
  },
}

export default function CustomerReservations({
  offerings,
  onNewBooking,
}: CustomerReservationsProps) {
  const { customer, token } = useCustomerAuth()

  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cancellation modal state
  const [cancellingReservation, setCancellingReservation] =
    useState<ReservationResponse | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null)

  const loadReservations = () => {
    if (!token) return
    setIsLoading(true)
    setError(null)

    fetchMyReservations(token)
      .then((data) => {
        setReservations(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Nie udało się pobrać Twoich rezerwacji.',
        )
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (token) {
      loadReservations()
    }
  }, [token])

  const offeringNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const off of offerings) {
      map.set(off.id, off.name)
    }
    return map
  }, [offerings])

  const now = new Date()

  // Split into upcoming and past
  const upcomingReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        const isFuture = new Date(r.startTime) > now
        return isFuture && r.status !== 'CANCELLED' && r.status !== 'COMPLETED'
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
  }, [reservations, now])

  const pastReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        const isPast = new Date(r.startTime) <= now
        return isPast || r.status === 'CANCELLED' || r.status === 'COMPLETED'
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
  }, [reservations, now])

  const handleConfirmCancel = async () => {
    if (!token || !cancellingReservation) return

    setIsCancelling(true)
    setError(null)
    try {
      await cancelReservation(token, cancellingReservation.id)
      setCancelSuccessMsg('Wizyta została pomyślnie odwołana.')
      setCancellingReservation(null)
      loadReservations()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się odwołać rezerwacji. Skontaktuj się z salonem telefonicznie.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  // If customer is not authenticated, show login prompt
  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
            Moje rezerwacje
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Zaloguj się swoim numerem telefonu, aby zobaczyć swoje nadchodzące i
            zrealizowane wizyty.
          </p>
        </div>

        <AuthStep onSuccess={loadReservations} onBack={onNewBooking} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
            Moje rezerwacje
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Konto klienta:{' '}
            <span className="font-semibold text-text-primary">
              {customer?.firstName} {customer?.lastName}
            </span>{' '}
            ({customer?.phoneNumber})
          </p>
        </div>

        <button
          type="button"
          onClick={onNewBooking}
          className="inline-flex items-center gap-1.5 rounded-md border border-action bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Zarezerwuj nową wizytę</span>
        </button>
      </div>

      {cancelSuccessMsg ? (
        <div className="rounded-lg bg-success-500/10 p-4 text-sm text-success-500 border border-success-500/20">
          {cancelSuccessMsg}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg bg-danger-500/10 p-4 text-sm text-danger-500 border border-danger-500/20">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div
          className="space-y-4 py-8 text-center"
          role="status"
          aria-live="polite"
        >
          <RefreshCw
            className="h-6 w-6 animate-spin text-action mx-auto"
            aria-hidden="true"
          />
          <p className="text-xs text-text-muted">Pobieranie listy wizyt...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-default p-8 text-center space-y-3">
          <Calendar
            className="h-8 w-8 text-text-muted mx-auto"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-text-primary">
            Nie masz jeszcze żadnych zarezerwowanych wizyt
          </p>
          <button
            type="button"
            onClick={onNewBooking}
            className="inline-flex items-center gap-2 rounded-md border border-action bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover transition-colors cursor-pointer"
          >
            <span>Wybierz zabieg i zarezerwuj termin</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming appointments */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
              <Calendar className="h-5 w-5 text-action" aria-hidden="true" />
              <span>Nadchodzące wizyty ({upcomingReservations.length})</span>
            </h3>

            {upcomingReservations.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                Brak nadchodzących wizyt.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingReservations.map((res) => {
                  const sDate = new Date(res.startTime)
                  const dateStr = sDate.toLocaleDateString('pl-PL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                  const timeStr = sDate.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const serviceName =
                    offeringNameById.get(res.serviceId) ||
                    `Usługa #${res.serviceId}`
                  const statusInfo = STATUS_LABELS[res.status] || {
                    label: res.status,
                    className:
                      'bg-surface-muted text-text-muted border-border-default',
                  }

                  return (
                    <div
                      key={res.id}
                      className="rounded-lg border border-border-default bg-surface p-5 shadow-xs flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-base font-semibold text-text-primary">
                            {serviceName}
                          </h4>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0',
                              statusInfo.className,
                            )}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-text-secondary">
                          <div className="flex items-center gap-1.5 font-medium text-text-primary">
                            <Clock
                              className="h-3.5 w-3.5 text-action"
                              aria-hidden="true"
                            />
                            <span className="capitalize">
                              {dateStr}, godz. {timeStr}
                            </span>
                          </div>
                          <div className="text-text-muted">
                            Cena:{' '}
                            <strong className="text-text-primary">
                              {res.price} zł
                            </strong>{' '}
                            • Nr rezerwacji: #{res.id}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border-default/60 pt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCancellingReservation(res)}
                          className="text-xs text-danger-500 hover:underline cursor-pointer font-medium"
                        >
                          Odwołaj wizytę
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Past appointments */}
          {pastReservations.length > 0 ? (
            <div className="space-y-4 border-t border-border-default pt-6">
              <h3 className="text-lg font-display font-semibold text-text-muted">
                Historia wizyt ({pastReservations.length})
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 opacity-80">
                {pastReservations.map((res) => {
                  const sDate = new Date(res.startTime)
                  const dateStr = sDate.toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  const timeStr = sDate.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const serviceName =
                    offeringNameById.get(res.serviceId) ||
                    `Usługa #${res.serviceId}`
                  const statusInfo = STATUS_LABELS[res.status] || {
                    label: res.status,
                    className:
                      'bg-surface-muted text-text-muted border-border-default',
                  }

                  return (
                    <div
                      key={res.id}
                      className="rounded-lg border border-border-default/60 bg-surface-muted/40 p-4 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-text-primary truncate">
                          {serviceName}
                        </span>
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0',
                            statusInfo.className,
                          )}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="mt-1 text-text-muted">
                        {dateStr}, {timeStr} • {res.price} zł
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingReservation ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-lg border border-border-default bg-surface p-6 shadow-raised space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-danger-500">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <h3
                  id="cancel-modal-title"
                  className="font-display text-lg font-semibold text-text-primary"
                >
                  Odwołanie rezerwacji
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingReservation(null)}
                className="text-text-muted hover:text-text-primary cursor-pointer p-1"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              Czy na pewno chcesz odwołać wizytę na zabieg{' '}
              <strong className="text-text-primary">
                {offeringNameById.get(cancellingReservation.serviceId) ||
                  'Zabieg'}
              </strong>{' '}
              zaplanowaną na{' '}
              <strong className="text-text-primary">
                {new Date(cancellingReservation.startTime).toLocaleString(
                  'pl-PL',
                  {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </strong>
              ?
            </p>

            <p className="text-xs text-text-muted">
              Pamiętaj, że bezpłatne odwołanie przysługuje do 24 godzin przed
              rozpoczęciem wizyty.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingReservation(null)}
                className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Nie odwołuj
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="inline-flex items-center gap-2 rounded-md border border-danger-500 bg-danger-500 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Odwoływanie...</span>
                  </>
                ) : (
                  <span>Tak, odwołaj wizytę</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
