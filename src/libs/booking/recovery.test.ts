import { beforeEach, describe, expect, it } from 'vitest'
import { BookingError } from './client'
import type { BookingBody, Session } from './contracts'
import {
  ATTEMPT_KEY,
  clearAttempt,
  definitiveFailure,
  eraseAttemptBodies,
  hasUnresolved,
  matches,
  newAttempt,
  RETENTION_MS,
  readAttempt,
  recoveryKey,
  saveAttempt,
  TOMBSTONE_KEY,
} from './recovery'

const session: Session = {
  userId: '00000000-0000-4000-8000-000000000001',
  companyId: '00000000-0000-4000-8000-000000000002',
  employmentId: null,
  username: '+48500100200',
  authorities: ['ROLE_CUSTOMER'],
}
const body: BookingBody = {
  serviceId: '00000000-0000-4000-8000-000000000003',
  quoteId: '00000000-0000-4000-8000-000000000004',
  employeeId: null,
  startTime: '2030-10-26T14:00:00',
  firstVisitDetails: { firstName: 'Ewa', lastName: 'Nowak' },
}
beforeEach(() => sessionStorage.clear())
describe('exact account-scoped recovery', () => {
  it('preserves key/body through reload and keeps another account independent', () => {
    const attempt = newAttempt(body, session)
    saveAttempt(attempt)
    const other = { ...session, userId: '00000000-0000-4000-8000-000000000005' }
    expect(readAttempt(other)).toBeNull()
    saveAttempt(newAttempt({ ...body, firstVisitDetails: undefined }, other))
    expect(readAttempt(session)).toEqual(attempt)
    expect(readAttempt(other)?.actorId).toBe(other.userId)
    expect(hasUnresolved(session)).toBe(true)
    clearAttempt(other)
    expect(readAttempt(session)).toEqual(attempt)
    expect(hasUnresolved(other)).toBe(false)
  })
  it('expires private payloads across every account and preserves unresolved markers', () => {
    const attempt = newAttempt(body, session)
    saveAttempt(attempt)
    expect(
      readAttempt(
        session,
        sessionStorage,
        attempt.createdAt + RETENTION_MS - 1,
      ),
    ).toEqual(attempt)
    const other = { ...session, userId: '00000000-0000-4000-8000-000000000005' }
    expect(
      readAttempt(other, sessionStorage, attempt.createdAt + RETENTION_MS),
    ).toBeNull()
    expect(sessionStorage.getItem(recoveryKey(ATTEMPT_KEY, session))).toBeNull()
    expect(hasUnresolved(session)).toBe(true)
  })
  it.each([
    {},
    { ...body, startTime: 12 },
    { ...body, firstVisitDetails: {} },
    { ...body, employeeId: 'wrong' },
    {
      ...body,
      firstVisitDetails: {
        firstName: 'Ewa',
        lastName: 'Nowak',
        extra: 'private',
      },
    },
  ])(
    'rejects malformed payload %j without rendering or reconstructing it',
    (invalid) => {
      const attempt = newAttempt(body, session)
      sessionStorage.setItem(
        recoveryKey(ATTEMPT_KEY, session),
        JSON.stringify({ ...attempt, body: invalid }),
      )
      expect(readAttempt(session)).toBeNull()
      expect(hasUnresolved(session)).toBe(true)
      expect(
        sessionStorage.getItem(recoveryKey(ATTEMPT_KEY, session)),
      ).toBeNull()
    },
  )
  it('rejects corrupt JSON and future timestamps and destroys PII on logout', () => {
    const key = recoveryKey(ATTEMPT_KEY, session)
    sessionStorage.setItem(key, '{invalid')
    expect(readAttempt(session)).toBeNull()
    const attempt = newAttempt(body, session)
    saveAttempt({ ...attempt, createdAt: Date.now() + 60000 })
    expect(readAttempt(session)).toBeNull()
    saveAttempt(attempt)
    eraseAttemptBodies()
    expect(readAttempt(session)).toBeNull()
    expect(sessionStorage.getItem(recoveryKey(TOMBSTONE_KEY, session))).toBe(
      'true',
    )
    expect(matches(attempt, { ...session, authorities: ['ROLE_OWNER'] })).toBe(
      false,
    )
    expect(matches(attempt, { ...session, employmentId: session.userId })).toBe(
      false,
    )
  })
})
describe('failure evidence', () => {
  it.each([
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [429, 'RATE_LIMIT_EXCEEDED'],
    [409, 'SESSION_CONTEXT_CHANGED'],
    [400, 'SESSION_CONTEXT_REQUIRED'],
    [409, 'IDEMPOTENCY_IN_PROGRESS'],
    [409, 'IDEMPOTENCY_CONFLICT'],
    [400, 'VALIDATION_ERROR'],
    [500, 'SERVER_ERROR'],
  ])('keeps an earlier unknown outcome after %i %s', (status, code) => {
    expect(
      definitiveFailure(
        new BookingError(status as number, code as string),
        true,
      ),
    ).toBe(false)
  })
  it('allows corrected business intent only after post-lookup failure', () => {
    expect(
      definitiveFailure(
        new BookingError(409, 'CUSTOMER_PROFILE_CHANGED'),
        true,
      ),
    ).toBe(true)
    expect(
      definitiveFailure(new BookingError(400, 'VALIDATION_ERROR'), false),
    ).toBe(true)
    expect(definitiveFailure(new TypeError('network'), true)).toBe(false)
  })
})
