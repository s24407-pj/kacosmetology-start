import { BookingError } from './client'
import type { BookingBody, Session } from './contracts'

export const ATTEMPT_KEY = 'kacosmetology.booking.attempt'
export const TOMBSTONE_KEY = 'kacosmetology.booking.unresolved'
export const RETENTION_MS = 30 * 60 * 1000
export type Attempt = {
  key: string
  body: BookingBody
  actorId: string
  companyId: string
  createdAt: number
  uncertain: boolean
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const localTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?$/
export function recoveryKey(
  prefix: string,
  session: Pick<Session, 'userId' | 'companyId'>,
): string {
  return `${prefix}:${session.companyId}:${session.userId}`
}
function isBody(body: unknown): body is BookingBody {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false
  const value = body as Record<string, unknown>
  if (
    typeof value.serviceId !== 'string' ||
    !uuid.test(value.serviceId) ||
    typeof value.quoteId !== 'string' ||
    !uuid.test(value.quoteId) ||
    typeof value.startTime !== 'string' ||
    !localTime.test(value.startTime) ||
    !(
      value.employeeId === null ||
      (typeof value.employeeId === 'string' && uuid.test(value.employeeId))
    )
  )
    return false
  if (value.firstVisitDetails !== undefined) {
    const details = value.firstVisitDetails as Record<string, unknown> | null
    if (
      !details ||
      typeof details !== 'object' ||
      Array.isArray(details) ||
      typeof details.firstName !== 'string' ||
      typeof details.lastName !== 'string' ||
      details.firstName.length > 100 ||
      details.lastName.length > 100 ||
      !(
        details.contactEmail === undefined ||
        (typeof details.contactEmail === 'string' &&
          details.contactEmail.length <= 255)
      )
    )
      return false
    if (
      Object.keys(details).some(
        (key) => !['firstName', 'lastName', 'contactEmail'].includes(key),
      )
    )
      return false
  }
  return Object.keys(value).every((key) =>
    [
      'serviceId',
      'employeeId',
      'startTime',
      'quoteId',
      'firstVisitDetails',
    ].includes(key),
  )
}
export function newAttempt(body: BookingBody, session: Session): Attempt {
  return {
    key: crypto.randomUUID(),
    body: structuredClone(body),
    actorId: session.userId,
    companyId: session.companyId!,
    createdAt: Date.now(),
    uncertain: false,
  }
}
export function matches(attempt: Attempt, session: Session): boolean {
  return (
    attempt.actorId === session.userId &&
    attempt.companyId === session.companyId &&
    session.employmentId === null &&
    session.authorities.length === 1 &&
    session.authorities[0] === 'ROLE_CUSTOMER'
  )
}
/** Per-account keys prevent a second login from overwriting the first account's unknown outcome. */
export function saveAttempt(
  attempt: Attempt,
  storage: Storage = sessionStorage,
) {
  const scope = { userId: attempt.actorId, companyId: attempt.companyId }
  storage.setItem(recoveryKey(TOMBSTONE_KEY, scope), 'true')
  storage.setItem(recoveryKey(ATTEMPT_KEY, scope), JSON.stringify(attempt))
}
/** Remove sensitive bodies across all scopes after 30 minutes; keep minimal unresolved markers. */
export function expireAttempts(
  storage: Storage = sessionStorage,
  now = Date.now(),
) {
  for (const key of Object.keys(storage)) {
    if (!key.startsWith(`${ATTEMPT_KEY}:`)) continue
    let keep = false
    try {
      const value = JSON.parse(storage.getItem(key) ?? 'null')
      keep =
        value &&
        typeof value.key === 'string' &&
        uuid.test(value.key) &&
        isBody(value.body) &&
        typeof value.actorId === 'string' &&
        uuid.test(value.actorId) &&
        typeof value.companyId === 'string' &&
        uuid.test(value.companyId) &&
        typeof value.uncertain === 'boolean' &&
        Number.isFinite(value.createdAt) &&
        value.createdAt <= now &&
        now - value.createdAt < RETENTION_MS &&
        key ===
          recoveryKey(ATTEMPT_KEY, {
            userId: value.actorId,
            companyId: value.companyId,
          })
    } catch {
      /* Corrupt storage cannot reconstruct the original request. */
    }
    if (!keep) {
      storage.setItem(key.replace(ATTEMPT_KEY, TOMBSTONE_KEY), 'true')
      storage.removeItem(key)
    }
  }
}
export function readAttempt(
  session: Session,
  storage: Storage = sessionStorage,
  now = Date.now(),
): Attempt | null {
  expireAttempts(storage, now)
  const raw = storage.getItem(recoveryKey(ATTEMPT_KEY, session))
  if (!raw) return null
  const value = JSON.parse(raw) as Attempt
  return matches(value, session) ? value : null
}
export function hasUnresolved(
  session: Session,
  storage: Storage = sessionStorage,
): boolean {
  return storage.getItem(recoveryKey(TOMBSTONE_KEY, session)) !== null
}
export function clearAttempt(
  session: Pick<Session, 'userId' | 'companyId'>,
  storage: Storage = sessionStorage,
) {
  storage.removeItem(recoveryKey(ATTEMPT_KEY, session))
  storage.removeItem(recoveryKey(TOMBSTONE_KEY, session))
}
/** Explicit logout destroys private recovery data, preserving only account-scoped uncertainty warnings. */
export function eraseAttemptBodies(storage: Storage = sessionStorage) {
  for (const key of Object.keys(storage))
    if (key.startsWith(`${ATTEMPT_KEY}:`)) storage.removeItem(key)
}
const resolvedBookingErrors = new Set([
  'SLOT_UNAVAILABLE',
  'CUSTOMER_PROFILE_CHANGED',
  'CUSTOMER_NAME_REQUIRED',
  'CUSTOMER_BLOCKED',
  'QUOTE_RECONFIRMATION_REQUIRED',
  'OFFERING_UNAVAILABLE',
  'CUSTOMER_NOT_FOUND',
  'EMPLOYEE_OFFERING_NOT_ASSIGNED',
  'BOOKING_ADVANCE_REQUIRED',
  'BOOKING_WINDOW_EXCEEDED',
  'BOOKING_LIMIT_REACHED',
])
/** An auth/rate-limit/validation response cannot resolve an earlier response lost in transit. */
export function definitiveFailure(
  error: unknown,
  wasUncertain: boolean,
): boolean {
  if (
    !(error instanceof BookingError) ||
    error.status < 400 ||
    error.status >= 500 ||
    [401, 403, 408, 425, 429].includes(error.status) ||
    [
      'SESSION_CONTEXT_REQUIRED',
      'SESSION_CONTEXT_CHANGED',
      'IDEMPOTENCY_IN_PROGRESS',
      'IDEMPOTENCY_CONFLICT',
    ].includes(error.code)
  )
    return false
  return !wasUncertain || resolvedBookingErrors.has(error.code)
}
