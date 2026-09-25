import { useCustomerAuth } from '@features/booking/hooks/useCustomerAuth'
import {
  BOOKING_STEPS,
  type BookingStep,
  type BookingViewMode,
} from '@features/booking/model/types'
import { cn } from '@libs/utils'
import { Calendar, Check, Clock, LogOut, User } from 'lucide-react'

interface BookingHeaderProps {
  viewMode: BookingViewMode
  onViewModeChange: (mode: BookingViewMode) => void
  currentStep: BookingStep
  onStepClick?: (step: BookingStep) => void
}

export default function BookingHeader({
  viewMode,
  onViewModeChange,
  currentStep,
  onStepClick,
}: BookingHeaderProps) {
  const { customer, logout } = useCustomerAuth()

  const currentStepDescriptor = BOOKING_STEPS.find((s) => s.id === currentStep)
  const currentStepIndex = currentStepDescriptor?.number ?? 1

  return (
    <div className="mb-8 border-b border-border-default pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* View Mode Tabs */}
        <div
          role="tablist"
          aria-label="Widok rezerwacji"
          className="inline-flex rounded-lg bg-surface-muted p-1 border border-border-default self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'wizard'}
            onClick={() => onViewModeChange('wizard')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              viewMode === 'wizard'
                ? 'bg-white text-action shadow-xs'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Nowa rezerwacja</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'my-reservations'}
            onClick={() => onViewModeChange('my-reservations')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              viewMode === 'my-reservations'
                ? 'bg-white text-action shadow-xs'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>Moje wizyty</span>
          </button>
        </div>

        {/* Customer status pill */}
        {customer ? (
          <div className="flex items-center gap-2 rounded-full border border-border-default bg-surface px-3 py-1.5 text-xs text-text-secondary">
            <User className="h-3.5 w-3.5 text-action" aria-hidden="true" />
            <span className="font-medium text-text-primary">
              {customer.firstName} {customer.lastName}
            </span>
            <span className="hidden sm:inline">({customer.phoneNumber})</span>
            <button
              type="button"
              onClick={logout}
              className="ml-1 inline-flex items-center gap-1 text-text-muted hover:text-danger-500 transition-colors"
              title="Wyloguj się"
              aria-label="Wyloguj się z systemu rezerwacji"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Stepper only shown in wizard mode and before confirmation */}
      {viewMode === 'wizard' && currentStep !== 'confirmation' ? (
        <nav aria-label="Kroki rezerwacji" className="mt-8">
          <ol className="grid grid-cols-5 gap-2 sm:gap-4">
            {BOOKING_STEPS.map((step) => {
              const isPast = step.number < currentStepIndex
              const isCurrent = step.number === currentStepIndex
              const canClick = isPast && onStepClick

              return (
                <li
                  key={step.id}
                  className="relative flex flex-col items-center text-center"
                >
                  <button
                    type="button"
                    disabled={!canClick}
                    onClick={() => canClick && onStepClick(step.id)}
                    className={cn(
                      'group flex flex-col items-center gap-1.5 focus-visible:outline-none',
                      canClick ? 'cursor-pointer' : 'cursor-default',
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-colors',
                        isPast
                          ? 'bg-action text-white'
                          : isCurrent
                            ? 'border-2 border-action bg-white text-action shadow-xs'
                            : 'border border-border-default bg-surface-muted text-text-muted',
                      )}
                    >
                      {isPast ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isCurrent
                          ? 'text-action font-semibold'
                          : isPast
                            ? 'text-text-primary'
                            : 'text-text-muted',
                      )}
                    >
                      <span className="hidden sm:inline">{step.title}</span>
                      <span className="sm:hidden">{step.shortTitle}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      ) : null}
    </div>
  )
}
