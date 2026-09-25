import type {
  AvailableSlot,
  PublicEmployee,
  PublicOffering,
  ReservationResponse,
} from '@libs/scheduler/types'

export type BookingStep =
  | 'service'
  | 'specialist'
  | 'datetime'
  | 'auth'
  | 'summary'
  | 'confirmation'

export type BookingViewMode = 'wizard' | 'my-reservations'

export interface BookingWizardState {
  step: BookingStep
  selectedOffering: PublicOffering | null
  selectedEmployee: PublicEmployee | null
  selectedDate: string | null // YYYY-MM-DD
  selectedSlot: AvailableSlot | null
  isSubmitting: boolean
  error: string | null
  createdReservation: ReservationResponse | null
}

export interface StepDescriptor {
  id: BookingStep
  number: number
  title: string
  shortTitle: string
}

export const BOOKING_STEPS: StepDescriptor[] = [
  { id: 'service', number: 1, title: 'Wybór zabiegu', shortTitle: 'Zabieg' },
  {
    id: 'specialist',
    number: 2,
    title: 'Wybór specjalisty',
    shortTitle: 'Specjalista',
  },
  { id: 'datetime', number: 3, title: 'Termin wizyty', shortTitle: 'Termin' },
  { id: 'auth', number: 4, title: 'Twoje dane', shortTitle: 'Dane' },
  {
    id: 'summary',
    number: 5,
    title: 'Podsumowanie',
    shortTitle: 'Potwierdzenie',
  },
]
