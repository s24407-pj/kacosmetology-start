import type { PublicEmployee, PublicOffering } from '@libs/scheduler/types'
import { cn } from '@libs/utils'
import { ArrowLeft, Sparkles, User, Users } from 'lucide-react'

interface EmployeeStepProps {
  employees: PublicEmployee[]
  selectedOffering: PublicOffering
  selectedEmployee: PublicEmployee | null
  onSelectEmployee: (employee: PublicEmployee) => void
  onBack: () => void
  isLoading?: boolean
}

export default function EmployeeStep({
  employees,
  selectedOffering,
  selectedEmployee,
  onSelectEmployee,
  onBack,
  isLoading = false,
}: EmployeeStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-8" role="status" aria-live="polite">
        <div className="h-6 w-48 animate-pulse rounded-md bg-surface-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-lg border border-border-default bg-surface-muted"
            />
          ))}
        </div>
        <span className="sr-only">Wczytywanie listy specjalistów...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
            Wybierz specjalistę
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Zabieg:{' '}
            <span className="font-semibold text-text-primary">
              {selectedOffering.name}
            </span>{' '}
            ({selectedOffering.durationMinutes} min)
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Zmień zabieg</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Any available option if multiple employees */}
        {employees.length > 1 ? (
          <button
            type="button"
            onClick={() => onSelectEmployee(employees[0])}
            aria-pressed={selectedEmployee?.id === employees[0].id}
            className={cn(
              'group relative flex items-center gap-4 rounded-lg border p-5 text-left transition-all duration-200 cursor-pointer',
              selectedEmployee?.id === employees[0].id
                ? 'border-action bg-primary-100/30 ring-2 ring-action/20 shadow-sm'
                : 'border-border-default bg-surface hover:border-action/40 hover:bg-surface-muted/50 hover:shadow-subtle',
            )}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-action">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-base font-semibold text-text-primary group-hover:text-action transition-colors">
                  Dowolny specjalista
                </h3>
                <Sparkles
                  className="h-3.5 w-3.5 text-action"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                Najszybszy dostępny termin u dowolnego wykwalifikowanego
                specjalisty
              </p>
            </div>
          </button>
        ) : null}

        {/* List of employees */}
        {employees.map((employee) => {
          const isSelected = selectedEmployee?.id === employee.id
          const fullName = employee.lastName
            ? `${employee.firstName} ${employee.lastName}`
            : employee.firstName

          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => onSelectEmployee(employee)}
              aria-pressed={isSelected}
              className={cn(
                'group relative flex items-center gap-4 rounded-lg border p-5 text-left transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-action bg-primary-100/30 ring-2 ring-action/20 shadow-sm'
                  : 'border-border-default bg-surface hover:border-action/40 hover:bg-surface-muted/50 hover:shadow-subtle',
              )}
            >
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={`Zdjęcie specjalisty: ${fullName}`}
                  className="h-14 w-14 shrink-0 rounded-full object-cover border border-border-default"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-muted border border-border-default text-action">
                  <User className="h-6 w-6" aria-hidden="true" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold text-text-primary group-hover:text-action transition-colors">
                  {fullName}
                </h3>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {employee.role === 'OWNER'
                    ? 'Kosmetolog, Trycholog • Właściciel'
                    : 'Kosmetolog, Stylistka'}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={cn(
                    'text-xs font-semibold transition-colors',
                    isSelected
                      ? 'text-action'
                      : 'text-action opacity-0 group-hover:opacity-100',
                  )}
                >
                  {isSelected ? 'Wybrano ✓' : 'Wybierz →'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
