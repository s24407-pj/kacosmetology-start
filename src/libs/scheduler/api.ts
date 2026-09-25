import { schedulerFetch } from './client'
import type {
  AuthResponse,
  AuthVerifyCodePayload,
  AvailableSlot,
  CreateReservationPayload,
  CustomerProfile,
  PublicCompanyProfile,
  PublicEmployee,
  PublicOffering,
  ReservationResponse,
} from './types'

export const DEFAULT_COMPANY_ID = 1

export async function fetchPublicCompanyProfile(
  companyId: number = DEFAULT_COMPANY_ID,
): Promise<PublicCompanyProfile> {
  return schedulerFetch<PublicCompanyProfile>(
    `/api/company/public/${companyId}`,
  )
}

export async function fetchPublicEmployees(
  companyId: number = DEFAULT_COMPANY_ID,
  offeringId?: number,
): Promise<PublicEmployee[]> {
  const query = offeringId ? `?offeringId=${offeringId}` : ''
  return schedulerFetch<PublicEmployee[]>(
    `/api/employees/public/company/${companyId}${query}`,
  )
}

export async function fetchPublicOfferings(
  companyId: number = DEFAULT_COMPANY_ID,
): Promise<PublicOffering[]> {
  return schedulerFetch<PublicOffering[]>(
    `/api/offerings/public/company/${companyId}`,
  )
}

export async function fetchAvailableSlots(
  employeeId: number,
  serviceId: number,
  date: string,
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({
    employeeId: String(employeeId),
    serviceId: String(serviceId),
    date,
  })
  return schedulerFetch<AvailableSlot[]>(
    `/api/availability?${params.toString()}`,
  )
}

export async function requestAuthCode(
  phoneNumber: string,
): Promise<{ message: string }> {
  return schedulerFetch<{ message: string }>('/api/auth/request-code', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  })
}

export async function verifyAuthCode(
  payload: AuthVerifyCodePayload,
): Promise<AuthResponse> {
  return schedulerFetch<AuthResponse>('/api/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchMyProfile(token: string): Promise<CustomerProfile> {
  return schedulerFetch<CustomerProfile>('/api/users/me', {
    token,
  })
}

export async function updateMyProfile(
  token: string,
  payload: { firstName?: string; lastName?: string; email?: string },
): Promise<CustomerProfile> {
  return schedulerFetch<CustomerProfile>('/api/users/me', {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
}

export async function createReservation(
  token: string,
  payload: CreateReservationPayload,
): Promise<ReservationResponse> {
  return schedulerFetch<ReservationResponse>('/api/reservations', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export async function fetchMyReservations(
  token: string,
): Promise<ReservationResponse[]> {
  return schedulerFetch<ReservationResponse[]>('/api/reservations/me', {
    token,
  })
}

export async function cancelReservation(
  token: string,
  reservationId: number,
): Promise<void> {
  return schedulerFetch<void>(`/api/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
    token,
  })
}
