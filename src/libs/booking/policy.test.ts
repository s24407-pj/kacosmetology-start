import { describe, expect, it } from 'vitest'
import {
  bookingHref,
  configuredServiceMap,
  internationalPhone,
  isCustomerSession,
  sessionContext,
  wallTime,
  warsawToday,
} from './policy'

describe('booking input and identity policy', () => {
  it('accepts explicit country prefixes without guessing national formats', () => {
    expect(internationalPhone('+48 (500) 100-200')).toBe('+48500100200')
    expect(internationalPhone('+442071234567')).toBe('+442071234567')
    for (const value of [
      '500100200',
      '0048500100200',
      '+048500100200',
      '+48letters',
      '+1',
      '+1234567890123456',
    ])
      expect(internationalPhone(value)).toBeNull()
  })
  it('uses explicit UUID mappings and never derives identity from marketing slugs', () => {
    const id = '00000000-0000-4000-8000-000000000003'
    expect(
      configuredServiceMap(
        JSON.stringify({
          'service-regulacja-brwi': id,
          'bad-key': id,
          'service-invalid': 'regulacja-brwi',
        }),
      ),
    ).toEqual({ 'service-regulacja-brwi': id })
    for (const raw of [undefined, 'bad', 'null', '[]', '1'])
      expect(configuredServiceMap(raw)).toEqual({})
    expect(bookingHref()).toBe('/rezerwacja')
    expect(bookingHref('service-regulacja-brwi')).toBe(
      '/rezerwacja?service=service-regulacja-brwi',
    )
  })
  it('uses Warsaw dates and keeps appointment wall times offset-free', () => {
    expect(warsawToday(new Date('2026-10-24T23:15:00Z'))).toBe('2026-10-25')
    expect(wallTime('2026-10-26T14:30:00')).toBe('2026-10-26 14:30')
  })
  it('requires the exact customer company and null employment', () => {
    const session = {
      userId: 'user',
      companyId: 'company',
      employmentId: null,
      authorities: ['ROLE_CUSTOMER'],
      username: 'phone',
    }
    expect(isCustomerSession(session, 'company')).toBe(true)
    expect(isCustomerSession(session, 'other')).toBe(false)
    expect(
      isCustomerSession({ ...session, employmentId: 'staff' }, 'company'),
    ).toBe(false)
    expect(
      isCustomerSession({ ...session, authorities: ['ROLE_OWNER'] }, 'company'),
    ).toBe(false)
    expect(sessionContext(session)).toBe('v1:user:company:null:ROLE_CUSTOMER')
  })
})
