import { PageHero } from '@components/ui'
import { services } from '@data/services'
import AuthStep from '@features/booking/components/AuthStep'
import BookingHeader from '@features/booking/components/BookingHeader'
import ConfirmationStep from '@features/booking/components/ConfirmationStep'
import CustomerReservations from '@features/booking/components/CustomerReservations'
import DateTimeStep from '@features/booking/components/DateTimeStep'
import EmployeeStep from '@features/booking/components/EmployeeStep'
import ReservationFallbackNotice from '@features/booking/components/ReservationFallbackNotice'
import ServiceStep from '@features/booking/components/ServiceStep'
import SummaryStep from '@features/booking/components/SummaryStep'
import {
  CustomerAuthProvider,
  useCustomerAuth,
} from '@features/booking/hooks/useCustomerAuth'
import type { BookingViewMode } from '@features/booking/model/types'
import { useBookingWizard } from '@features/booking/model/useBookingWizard'
import {
  DEFAULT_COMPANY_ID,
  fetchPublicEmployees,
  fetchPublicOfferings,
} from '@libs/scheduler/api'
import type { PublicEmployee, PublicOffering } from '@libs/scheduler/types'
import { useEffect, useMemo, useState } from 'react'

interface BookingPageProps {
  initialServiceId?: string | number | null
}

function BookingPageContent({ initialServiceId }: BookingPageProps) {
  const { token } = useCustomerAuth()
  const [viewMode, setViewMode] = useState<BookingViewMode>('wizard')

  const [offerings, setOfferings] = useState<PublicOffering[]>([])
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true)

  const [employees, setEmployees] = useState<PublicEmployee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Load offerings on mount
  useEffect(() => {
    let isMounted = true
    setIsLoadingOfferings(true)

    fetchPublicOfferings(DEFAULT_COMPANY_ID)
      .then((data) => {
        if (isMounted) {
          setOfferings(data)
          setIsLoadingOfferings(false)
        }
      })
      .catch(() => {
        // Fallback: populate from static catalog if backend offline
        if (isMounted) {
          const fallbackOfferings: PublicOffering[] = services
            .filter((s) => s.isPublished)
            .map((s, index) => ({
              id: index + 1,
              companyId: DEFAULT_COMPANY_ID,
              name: s.name,
              durationMinutes: s.duration,
              price: s.price,
              active: true,
              categoryId:
                s.category === 'trichology'
                  ? 2
                  : s.category === 'eye-styling'
                    ? 1
                    : 3,
            }))
          setOfferings(fallbackOfferings)
          setIsLoadingOfferings(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Find initial offering from initialServiceId if provided
  const initialOffering = useMemo(() => {
    if (!initialServiceId || offerings.length === 0) return null

    // By numerical ID
    const byId = offerings.find(
      (o) => String(o.id) === String(initialServiceId),
    )
    if (byId) return byId

    // By slug / name match
    const byName = offerings.find(
      (o) =>
        o.name.toLowerCase() === String(initialServiceId).toLowerCase() ||
        String(initialServiceId).includes(o.name.toLowerCase()),
    )
    return byName || null
  }, [initialServiceId, offerings])

  const wizard = useBookingWizard({
    token,
    initialOffering,
  })

  // Load employees when offering is chosen
  useEffect(() => {
    if (!wizard.selectedOffering) return

    let isMounted = true
    setIsLoadingEmployees(true)

    fetchPublicEmployees(DEFAULT_COMPANY_ID, wizard.selectedOffering.id)
      .then((data) => {
        if (isMounted) {
          if (data.length > 0) {
            setEmployees(data)
          } else {
            // Default to owner if none returned
            setEmployees([
              {
                id: 1,
                firstName: 'Katarzyna',
                lastName: 'Suwalska',
                role: 'OWNER',
              },
            ])
          }
          setIsLoadingEmployees(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setEmployees([
            {
              id: 1,
              firstName: 'Katarzyna',
              lastName: 'Suwalska',
              role: 'OWNER',
            },
          ])
          setIsLoadingEmployees(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [wizard.selectedOffering])

  return (
    <div className="min-h-screen bg-sand/30 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PageHero
          align="center"
          maxWidth="medium"
          eyebrow="Rezerwacja online"
          title="Umów wizytę w salonie"
          description="Zarezerwuj dogodny termin zabiegu w Ka.Cosmetology w Starogardzie Gdańskim. Szybkie potwierdzenie SMS bez zbędnych formalności."
        />

        <div className="mt-8 rounded-xl border border-border-default bg-surface p-6 sm:p-8 shadow-raised">
          <BookingHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentStep={wizard.step}
            onStepClick={wizard.goToStep}
          />

          {viewMode === 'my-reservations' ? (
            <CustomerReservations
              offerings={offerings}
              onNewBooking={() => {
                setViewMode('wizard')
                wizard.resetBooking()
              }}
            />
          ) : (
            <div>
              {wizard.step === 'service' && (
                <ServiceStep
                  offerings={offerings}
                  selectedOffering={wizard.selectedOffering}
                  onSelectOffering={wizard.selectOffering}
                  isLoading={isLoadingOfferings}
                />
              )}

              {wizard.step === 'specialist' && wizard.selectedOffering && (
                <EmployeeStep
                  employees={employees}
                  selectedOffering={wizard.selectedOffering}
                  selectedEmployee={wizard.selectedEmployee}
                  onSelectEmployee={wizard.selectEmployee}
                  onBack={wizard.goBack}
                  isLoading={isLoadingEmployees}
                />
              )}

              {wizard.step === 'datetime' &&
                wizard.selectedOffering &&
                wizard.selectedEmployee && (
                  <DateTimeStep
                    employee={wizard.selectedEmployee}
                    offering={wizard.selectedOffering}
                    selectedDate={wizard.selectedDate}
                    selectedSlot={wizard.selectedSlot}
                    onSelectDate={wizard.selectDate}
                    onSelectSlot={wizard.selectSlot}
                    onBack={wizard.goBack}
                  />
                )}

              {wizard.step === 'auth' && (
                <AuthStep
                  onSuccess={wizard.onAuthComplete}
                  onBack={wizard.goBack}
                />
              )}

              {wizard.step === 'summary' &&
                wizard.selectedOffering &&
                wizard.selectedEmployee &&
                wizard.selectedDate &&
                wizard.selectedSlot && (
                  <SummaryStep
                    offering={wizard.selectedOffering}
                    employee={wizard.selectedEmployee}
                    date={wizard.selectedDate}
                    slot={wizard.selectedSlot}
                    isSubmitting={wizard.isSubmitting}
                    error={wizard.error}
                    onSubmit={wizard.submitReservation}
                    onBack={wizard.goBack}
                  />
                )}

              {wizard.step === 'confirmation' &&
                wizard.createdReservation &&
                wizard.selectedOffering &&
                wizard.selectedEmployee && (
                  <ConfirmationStep
                    reservation={wizard.createdReservation}
                    offering={wizard.selectedOffering}
                    employee={wizard.selectedEmployee}
                    onViewMyReservations={() => setViewMode('my-reservations')}
                    onNewBooking={wizard.resetBooking}
                  />
                )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <ReservationFallbackNotice />
        </div>
      </div>
    </div>
  )
}

export default function BookingPage(props: BookingPageProps) {
  return (
    <CustomerAuthProvider>
      <BookingPageContent {...props} />
    </CustomerAuthProvider>
  )
}
