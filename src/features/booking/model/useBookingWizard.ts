import { analytics } from '@libs/analytics'
import { createReservation } from '@libs/scheduler/api'
import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
} from '@libs/scheduler/types'
import { useCallback, useState } from 'react'
import type { BookingStep, BookingWizardState } from './types'

export interface UseBookingWizardOptions {
  token: string | null
  initialOffering?: PublicOffering | null
}

export function useBookingWizard({
  token,
  initialOffering = null,
}: UseBookingWizardOptions) {
  const [state, setState] = useState<BookingWizardState>({
    step: initialOffering ? 'specialist' : 'service',
    selectedOffering: initialOffering,
    selectedEmployee: null,
    selectedDate: null,
    selectedSlot: null,
    isSubmitting: false,
    error: null,
    createdReservation: null,
  })

  const selectOffering = useCallback((offering: PublicOffering) => {
    setState((prev) => ({
      ...prev,
      selectedOffering: offering,
      selectedEmployee: null,
      selectedDate: null,
      selectedSlot: null,
      error: null,
      step: 'specialist',
    }))

    analytics.trackInitiateCheckout({
      placement: 'booking_wizard_service_selected',
      serviceName: offering.name,
    })
  }, [])

  const selectEmployee = useCallback((employee: PublicEmployee) => {
    setState((prev) => ({
      ...prev,
      selectedEmployee: employee,
      selectedSlot: null,
      error: null,
      step: 'datetime',
    }))
  }, [])

  const selectDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedSlot: null,
      error: null,
    }))
  }, [])

  const selectSlot = useCallback(
    (slot: AvailableSlot) => {
      setState((prev) => {
        const nextStep = token ? 'summary' : 'auth'
        return {
          ...prev,
          selectedSlot: slot,
          error: null,
          step: nextStep,
        }
      })
    },
    [token],
  )

  const onAuthComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'summary',
      error: null,
    }))
  }, [])

  const goToStep = useCallback((targetStep: BookingStep) => {
    setState((prev) => {
      // Validate preconditions
      if (
        (targetStep === 'specialist' ||
          targetStep === 'datetime' ||
          targetStep === 'auth' ||
          targetStep === 'summary') &&
        !prev.selectedOffering
      ) {
        return prev
      }
      if (
        (targetStep === 'datetime' ||
          targetStep === 'auth' ||
          targetStep === 'summary') &&
        !prev.selectedEmployee
      ) {
        return prev
      }
      if (
        (targetStep === 'auth' || targetStep === 'summary') &&
        (!prev.selectedDate || !prev.selectedSlot)
      ) {
        return prev
      }

      return {
        ...prev,
        step: targetStep,
        error: null,
      }
    })
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case 'specialist':
          return { ...prev, step: 'service' }
        case 'datetime':
          return { ...prev, step: 'specialist' }
        case 'auth':
          return { ...prev, step: 'datetime' }
        case 'summary':
          return { ...prev, step: token ? 'datetime' : 'auth' }
        default:
          return prev
      }
    })
  }, [token])

  const submitReservation = useCallback(async () => {
    if (!token) {
      setState((prev) => ({
        ...prev,
        error: 'Musisz być zalogowany, aby dokonać rezerwacji.',
        step: 'auth',
      }))
      return
    }

    if (
      !state.selectedOffering ||
      !state.selectedEmployee ||
      !state.selectedDate ||
      !state.selectedSlot
    ) {
      setState((prev) => ({
        ...prev,
        error: 'Uzupełnij wszystkie wymagane dane rezerwacji.',
      }))
      return
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    const formattedTime =
      state.selectedSlot.time.length === 5
        ? `${state.selectedSlot.time}:00`
        : state.selectedSlot.time

    const startTime = `${state.selectedDate}T${formattedTime}`

    try {
      const reservation = await createReservation(token, {
        employeeId: state.selectedEmployee.id,
        serviceId: state.selectedOffering.id,
        startTime,
      })

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        createdReservation: reservation,
        step: 'confirmation',
        error: null,
      }))

      analytics.trackPurchase({
        bookingId: String(reservation.id),
        value: reservation.price,
        currency: 'PLN',
        serviceCategory: state.selectedOffering.name,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Wystąpił błąd podczas potwierdzania rezerwacji.'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: message,
      }))
    }
  }, [state, token])

  const resetBooking = useCallback(() => {
    setState({
      step: 'service',
      selectedOffering: null,
      selectedEmployee: null,
      selectedDate: null,
      selectedSlot: null,
      isSubmitting: false,
      error: null,
      createdReservation: null,
    })
  }, [])

  return {
    ...state,
    selectOffering,
    selectEmployee,
    selectDate,
    selectSlot,
    onAuthComplete,
    goToStep,
    goBack,
    submitReservation,
    resetBooking,
  }
}
