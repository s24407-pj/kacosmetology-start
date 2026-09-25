export interface PublicCompanyProfile {
  id: number
  name: string
  openingTime: string
  closingTime: string
  slotIntervalMinutes: number
  lastMinuteDiscountPercent: number
  lastMinuteDiscountHours: number
  minBookingAdvanceMinutes: number
}

export interface PublicEmployee {
  id: number
  firstName: string
  photoUrl?: string | null
  lastName?: string | null
  role?: string | null
}

export interface OfferingImage {
  id: number
  offeringId: number
  imageUrl: string
}

export interface PublicOffering {
  id: number
  companyId: number
  name: string
  durationMinutes: number
  price: number
  active: boolean
  categoryId: number | null
  createdAt?: string | null
  images?: OfferingImage[]
}

export interface AvailableSlot {
  time: string
  price: number
  originalPrice: number
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface ReservationResponse {
  id: number
  employeeId: number
  serviceId: number
  price: number
  startTime: string
  endTime: string
  status: ReservationStatus
  createdAt?: string | null
}

export interface CustomerProfile {
  id: number
  phoneNumber: string
  firstName: string
  lastName: string
  email?: string | null
  photoUrl?: string | null
}

export interface AuthRequestCodePayload {
  phoneNumber: string
}

export interface AuthVerifyCodePayload {
  phoneNumber: string
  code: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  token: string
}

export interface CreateReservationPayload {
  employeeId: number
  serviceId: number
  startTime: string
}

export interface SchedulerApiError {
  status: number
  message: string
  timestamp?: string
  details?: Record<string, string>
}
