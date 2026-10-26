import type { Session } from './contracts'

export function sessionContext(session: Session): string {
  return `v1:${session.userId}:${session.companyId}:${session.employmentId}:ROLE_CUSTOMER`
}
export function isCustomerSession(
  session: Session,
  companyId: string,
): boolean {
  return (
    session.companyId === companyId &&
    session.employmentId === null &&
    session.authorities.length === 1 &&
    session.authorities[0] === 'ROLE_CUSTOMER'
  )
}
export function warsawToday(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
/** Scheduler LocalDateTime means Warsaw wall time, never the browser's time zone. */
export function wallTime(value: string): string {
  return value.replace('T', ' ').slice(0, 16)
}
export function internationalPhone(value: string): string | null {
  const phone = value.replace(/[\s()-]/g, '')
  return /^\+[1-9][0-9]{8,14}$/.test(phone) ? phone : null
}
export function configuredServiceMap(
  raw: string | undefined,
): Record<string, string> {
  if (!raw) return {}
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(
      Object.entries(value).filter(
        ([key, id]) =>
          key.startsWith('service-') &&
          typeof id === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            id,
          ),
      ),
    )
  } catch {
    return {}
  }
}
export const companyId = import.meta.env.VITE_SCHEDULER_COMPANY_ID ?? ''
export const serviceMap = configuredServiceMap(
  import.meta.env.VITE_SCHEDULER_SERVICE_MAP,
)

export function bookingHref(serviceId?: string): string {
  return serviceId
    ? `/rezerwacja?service=${encodeURIComponent(serviceId)}`
    : '/rezerwacja'
}
