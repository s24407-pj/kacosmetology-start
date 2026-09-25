import type {
  PublicEmployee,
  PublicOffering,
  ReservationResponse,
} from '@libs/scheduler/types'
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  User,
} from 'lucide-react'
import { useMemo } from 'react'

interface ConfirmationStepProps {
  reservation: ReservationResponse
  offering: PublicOffering
  employee: PublicEmployee
  onViewMyReservations: () => void
  onNewBooking: () => void
}

export default function ConfirmationStep({
  reservation,
  offering,
  employee,
  onViewMyReservations,
  onNewBooking,
}: ConfirmationStepProps) {
  const startDate = useMemo(
    () => new Date(reservation.startTime),
    [reservation.startTime],
  )
  const endDate = useMemo(
    () => new Date(reservation.endTime),
    [reservation.endTime],
  )

  const formattedDate = useMemo(() => {
    return startDate.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [startDate])

  const formattedTime = useMemo(() => {
    const s = startDate.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const e = endDate.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${s} - ${e}`
  }, [startDate, endDate])

  // Download .ics file
  const handleDownloadIcs = () => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const formatIcsDate = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

    const startIcs = formatIcsDate(startDate)
    const endIcs = formatIcsDate(endDate)

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ka.Cosmetology//System Rezerwacji//PL',
      'BEGIN:VEVENT',
      `UID:kacosmetology-${reservation.id}@kacosmetology.pl`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${startIcs}`,
      `DTEND:${endIcs}`,
      `SUMMARY:Ka.Cosmetology: ${offering.name}`,
      `DESCRIPTION:Zabieg: ${offering.name}\\nSpecjalista: ${employee.firstName}\\nCena: ${reservation.price} zł`,
      'LOCATION:Ka.Cosmetology\\, ul. Paderewskiego 11a\\, 83-200 Starogard Gdański',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rezerwacja-${reservation.id}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Google Calendar link
  const googleCalendarUrl = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const formatGoogleDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`

    const title = encodeURIComponent(`Ka.Cosmetology: ${offering.name}`)
    const details = encodeURIComponent(
      `Zabieg: ${offering.name}\nSpecjalista: ${employee.firstName}\nCena: ${reservation.price} zł\nNumer rezerwacji: #${reservation.id}`,
    )
    const location = encodeURIComponent(
      'Ka.Cosmetology, ul. Paderewskiego 11a, Starogard Gdański',
    )
    const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
  }, [
    startDate,
    endDate,
    offering.name,
    employee.firstName,
    reservation.id,
    reservation.price,
  ])

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10 text-success-500 mb-2">
          <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Wizyta została zarezerwowana!
        </h2>
        <p className="text-sm text-text-secondary">
          Numer Twojej rezerwacji:{' '}
          <span className="font-mono font-bold text-text-primary">
            #{reservation.id}
          </span>
        </p>
      </div>

      {/* Appointment Summary Box */}
      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between border-b border-border-default/60 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Zabieg
            </span>
            <h3 className="font-display text-lg font-semibold text-text-primary mt-0.5">
              {offering.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {offering.durationMinutes} minut
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Cena
            </span>
            <p className="text-lg font-bold text-action mt-0.5">
              {reservation.price}&nbsp;zł
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="flex items-center gap-2.5">
            <Calendar
              className="h-4 w-4 text-action shrink-0"
              aria-hidden="true"
            />
            <span className="capitalize font-medium text-text-primary">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock
              className="h-4 w-4 text-action shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium text-text-primary">
              Godzina: {formattedTime}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-action shrink-0" aria-hidden="true" />
            <span>
              Specjalista:{' '}
              <strong className="text-text-primary">
                {employee.firstName}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin
              className="h-4 w-4 text-action shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs text-text-muted truncate">
              ul. Paderewskiego 11a, Starogard Gd.
            </span>
          </div>
        </div>

        <div className="rounded-md bg-surface-muted p-3 text-xs text-text-secondary flex items-start gap-2.5 border border-border-default/60">
          <MessageSquare
            className="h-4 w-4 text-action shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>
            Potwierdzenie wysłaliśmy wiadomością SMS. Dzień przed planowaną
            wizytą otrzymasz również SMS z przypomnieniem o terminie.
          </span>
        </div>
      </div>

      {/* Calendar Add Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownloadIcs}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <CalendarPlus className="h-4 w-4 text-action" aria-hidden="true" />
          <span>Pobierz plik kalendarza (.ics)</span>
        </button>

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 text-action" aria-hidden="true" />
          <span>Dodaj do Kalendarza Google</span>
        </a>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-default pt-6">
        <button
          type="button"
          onClick={onViewMyReservations}
          className="w-full sm:w-auto rounded-md border border-action bg-action px-6 py-2.5 text-sm font-semibold text-white hover:bg-action-hover transition-colors cursor-pointer"
        >
          Przejdź do moich wizyt
        </button>

        <button
          type="button"
          onClick={onNewBooking}
          className="w-full sm:w-auto text-sm text-action hover:underline py-2"
        >
          Zarezerwuj kolejną wizytę
        </button>
      </div>
    </div>
  )
}
