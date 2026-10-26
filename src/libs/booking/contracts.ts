import type { components } from './schema'

type Schemas = components['schemas']
/** springdoc marks response fields optional; these are the fields required by this journey. */
type Present<T> = { [K in keyof T]-?: NonNullable<T[K]> }
export type Session = Present<
  Pick<
    Schemas['AuthenticatedSessionResponse'],
    'userId' | 'username' | 'authorities'
  >
> &
  Required<
    Pick<Schemas['AuthenticatedSessionResponse'], 'companyId' | 'employmentId'>
  >
export type Profile = Present<Schemas['CustomerAccountResponse']>
export type Offering = Present<
  Pick<
    Schemas['OfferingResponse'],
    'id' | 'companyId' | 'name' | 'durationMinutes' | 'price' | 'active'
  >
>
export type Employee = Present<
  Pick<Schemas['PublicEmployeeResponse'], 'id' | 'firstName' | 'lastName'>
>
export type Slot = Present<Schemas['AvailableSlotResponse']>
export type Quote = Present<Schemas['QuoteResponse']>
export type BookingBody = Pick<
  Schemas['CreateReservationRequest'],
  'firstVisitDetails'
> &
  Present<
    Pick<
      Schemas['CreateReservationRequest'],
      'serviceId' | 'startTime' | 'quoteId'
    >
  > & { employeeId: Schemas['CreateReservationRequest']['employeeId'] }
export type Reservation = Present<
  Pick<
    Schemas['ReservationResponse'],
    | 'id'
    | 'companyId'
    | 'companyName'
    | 'serviceName'
    | 'employeeName'
    | 'startTime'
    | 'endTime'
    | 'status'
    | 'price'
    | 'durationMinutes'
    | 'archived'
  >
> &
  Pick<Schemas['ReservationResponse'], 'companyAddress'>
