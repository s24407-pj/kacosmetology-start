import { fetchAvailableSlots } from '@libs/scheduler/api'
import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
} from '@libs/scheduler/types'
import { cn } from '@libs/utils'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface DateTimeStepProps {
  employee: PublicEmployee
  offering: PublicOffering
  selectedDate: string | null
  selectedSlot: AvailableSlot | null
  onSelectDate: (date: string) => void
  onSelectSlot: (slot: AvailableSlot) => void
  onBack: () => void
}

const MONTH_NAMES = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
]

const DAY_NAMES = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So', 'Nd']

export default function DateTimeStep({
  employee,
  offering,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  onBack,
}: DateTimeStepProps) {
  // Current view month (defaults to selectedDate or today)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return new Date()
  })

  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)

  // Auto-select first upcoming available day (e.g. tomorrow or today) if none selected
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date()
      // If Sunday (0), pick Monday
      const target = new Date(today)
      if (target.getDay() === 0) {
        target.setDate(target.getDate() + 1)
      }
      const y = target.getFullYear()
      const m = String(target.getMonth() + 1).padStart(2, '0')
      const d = String(target.getDate()).padStart(2, '0')
      onSelectDate(`${y}-${m}-${d}`)
    }
  }, [selectedDate, onSelectDate])

  // Fetch slots whenever selectedDate or employee/offering changes
  useEffect(() => {
    if (!selectedDate) return

    let isMounted = true
    setIsLoadingSlots(true)
    setSlotError(null)

    fetchAvailableSlots(employee.id, offering.id, selectedDate)
      .then((data) => {
        if (isMounted) {
          setSlots(data)
          setIsLoadingSlots(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setSlotError(
            err instanceof Error
              ? err.message
              : 'Nie udało się pobrać dostępnych terminów.',
          )
          setSlots([])
          setIsLoadingSlots(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [employee.id, offering.id, selectedDate])

  // Build calendar matrix for viewDate
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // 0 = Sunday, 1 = Monday in JS Date -> convert so Monday is 0
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6

    const days: {
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isPast: boolean
      isSunday: boolean
    }[] = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const prevDate = new Date(year, month - 1, d)
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isPast: true,
        isSunday: prevDate.getDay() === 0,
      })
    }

    const todayStr = new Date().toISOString().split('T')[0]

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const curDate = new Date(year, month, d)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isPast: dateStr < todayStr,
        isSunday: curDate.getDay() === 0,
      })
    }

    // Next month padding to fill row
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d)
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isPast: false,
        isSunday: nextDate.getDay() === 0,
      })
    }

    return days
  }, [viewDate])

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  // Format date display in Polish (e.g. "Czwartek, 25 września 2026")
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return ''
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [selectedDate])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
            Wybierz termin wizyty
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Specjalista:{' '}
            <span className="font-semibold text-text-primary">
              {employee.firstName} {employee.lastName || ''}
            </span>{' '}
            • Zabieg: {offering.name} ({offering.durationMinutes} min)
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Zmień specjalistę</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Calendar Picker Column */}
        <div className="lg:col-span-6 rounded-lg border border-border-default bg-surface p-5 shadow-xs">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-display text-base font-semibold text-text-primary">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Poprzedni miesiąc"
                className="rounded-md border border-border-default p-1.5 text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Następny miesiąc"
                className="rounded-md border border-border-default p-1.5 text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-text-muted pb-2">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item) => {
              const isSelected = selectedDate === item.dateStr
              const isDisabled =
                item.isPast || item.isSunday || !item.isCurrentMonth

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectDate(item.dateStr)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-action font-semibold text-white shadow-xs'
                      : isDisabled
                        ? 'cursor-not-allowed text-text-muted/40 opacity-40'
                        : 'cursor-pointer text-text-primary hover:bg-primary-100/50 hover:text-action',
                    !item.isCurrentMonth && 'invisible',
                  )}
                >
                  {item.dayNum}
                </button>
              )
            })}
          </div>

          <p className="mt-4 border-t border-border-default/60 pt-3 text-xs text-text-muted">
            * Gabinet czynny od poniedziałku do soboty. Niedziele są dniami
            wolnymi.
          </p>
        </div>

        {/* Available Hours Column */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <div className="rounded-lg border border-border-default bg-surface p-5 shadow-xs flex-1">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <Clock className="h-4 w-4 text-action" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold capitalize text-text-primary">
                {formattedSelectedDate || 'Wybierz dzień'}
              </h3>
            </div>

            <div className="mt-4">
              {isLoadingSlots ? (
                <div
                  className="space-y-3 py-6 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-action border-t-transparent" />
                  <p className="text-xs text-text-muted">
                    Sprawdzanie dostępnych godzin...
                  </p>
                </div>
              ) : slotError ? (
                <div className="rounded-md bg-danger-500/10 p-4 text-xs text-danger-500">
                  {slotError}
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-text-primary">
                    Brak wolnych terminów w wybranym dniu
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Wybierz inną datę w kalendarzu lub skontaktuj się z nami
                    telefonicznie.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.time === slot.time
                    const hasDiscount = slot.price < slot.originalPrice
                    const displayTime = slot.time.slice(0, 5) // HH:mm

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => onSelectSlot(slot)}
                        aria-pressed={isSelected}
                        className={cn(
                          'relative flex flex-col items-center justify-center rounded-md border p-2.5 transition-all cursor-pointer',
                          isSelected
                            ? 'border-action bg-action text-white shadow-xs'
                            : 'border-border-default bg-surface hover:border-action hover:bg-surface-muted',
                        )}
                      >
                        <span className="text-sm font-semibold">
                          {displayTime}
                        </span>

                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                          {hasDiscount ? (
                            <>
                              <span
                                className={cn(
                                  'line-through text-xs',
                                  isSelected
                                    ? 'text-white/70'
                                    : 'text-text-muted',
                                )}
                              >
                                {slot.originalPrice}&nbsp;zł
                              </span>
                              <span
                                className={cn(
                                  'font-bold',
                                  isSelected ? 'text-white' : 'text-danger-500',
                                )}
                              >
                                {slot.price}&nbsp;zł
                              </span>
                            </>
                          ) : (
                            <span
                              className={cn(
                                'text-xs',
                                isSelected
                                  ? 'text-white/90'
                                  : 'text-text-secondary',
                              )}
                            >
                              {slot.price}&nbsp;zł
                            </span>
                          )}
                        </div>

                        {hasDiscount ? (
                          <span
                            className={cn(
                              'absolute -top-2 -right-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                              isSelected
                                ? 'bg-white text-action'
                                : 'bg-action text-white',
                            )}
                          >
                            <Sparkles
                              className="h-2.5 w-2.5"
                              aria-hidden="true"
                            />
                            Last minute
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
