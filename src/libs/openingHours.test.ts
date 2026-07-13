import { describe, expect, it, vi } from 'vitest'

import {
  getCurrentOpeningSnapshot,
  isOpeningSlotActive,
  isSalonOpenNow,
} from './openingHours'

describe('getCurrentOpeningSnapshot', () => {
  it('returns the correct Polish day name and minutes for a given date', () => {
    // 2025-10-15 Wednesday, 14:30 UTC+2 (CEST) = 14:30 Warsaw time
    const date = new Date('2025-10-15T12:30:00Z')
    const snapshot = getCurrentOpeningSnapshot(date)

    expect(snapshot.currentDayName).toBe('środa')
    expect(snapshot.currentMinutes).toBe(14 * 60 + 30)
  })

  it('returns the correct day and minutes at midnight Warsaw time', () => {
    // 2025-11-03 Monday, 23:00 UTC = 00:00 Warsaw time (CET, UTC+1)
    const date = new Date('2025-11-03T23:00:00Z')
    const snapshot = getCurrentOpeningSnapshot(date)

    expect(snapshot.currentDayName).toBe('wtorek')
    expect(snapshot.currentMinutes).toBe(0)
  })

  it('handles the DST boundary correctly (Warsaw switches from CEST to CET)', () => {
    // 2025-10-26 at 01:30 UTC = 02:30 CEST (before switch) — still Sunday
    const before = new Date('2025-10-25T23:30:00Z')
    const snapshotBefore = getCurrentOpeningSnapshot(before)

    // 2025-10-26 01:30 UTC = 02:30 CET (after switch)
    const after = new Date('2025-10-26T01:30:00Z')
    const snapshotAfter = getCurrentOpeningSnapshot(after)

    expect(snapshotBefore.currentDayName).toBe('niedziela')
    expect(snapshotAfter.currentDayName).toBe('niedziela')
    // Both should be Sunday, but different minutes
    expect(snapshotBefore.currentMinutes).not.toBe(snapshotAfter.currentMinutes)
  })
})

describe('isOpeningSlotActive', () => {
  const mondayAt10 = { currentDayName: 'poniedziałek', currentMinutes: 10 * 60 }
  const mondayAt930 = {
    currentDayName: 'poniedziałek',
    currentMinutes: 9 * 60 + 30,
  }
  const mondayAt17 = { currentDayName: 'poniedziałek', currentMinutes: 17 * 60 }
  const mondayAt9 = { currentDayName: 'poniedziałek', currentMinutes: 9 * 60 }

  it('returns true when current time is within the opening hours', () => {
    expect(isOpeningSlotActive('9:00-17:00', 'poniedziałek', mondayAt10)).toBe(
      true,
    )
  })

  it('returns true at the exact start of the opening window (inclusive)', () => {
    expect(isOpeningSlotActive('9:00-17:00', 'poniedziałek', mondayAt9)).toBe(
      true,
    )
  })

  it('returns false at the exact end of the opening window (exclusive)', () => {
    expect(isOpeningSlotActive('9:00-17:00', 'poniedziałek', mondayAt17)).toBe(
      false,
    )
  })

  it('returns false when current time is before opening hours', () => {
    const mondayAt8 = {
      currentDayName: 'poniedziałek',
      currentMinutes: 8 * 60 + 59,
    }
    expect(isOpeningSlotActive('9:00-17:00', 'poniedziałek', mondayAt8)).toBe(
      false,
    )
  })

  it('returns false when current time is after closing hours', () => {
    const mondayAt18 = {
      currentDayName: 'poniedziałek',
      currentMinutes: 18 * 60,
    }
    expect(isOpeningSlotActive('9:00-17:00', 'poniedziałek', mondayAt18)).toBe(
      false,
    )
  })

  it('returns false when the day does not match', () => {
    const tuesday = { currentDayName: 'wtorek', currentMinutes: 10 * 60 }
    expect(isOpeningSlotActive('9:00-17:00', 'poniedziałek', tuesday)).toBe(
      false,
    )
  })

  it('returns false when hours is "Zamknięte"', () => {
    expect(isOpeningSlotActive('Zamknięte', 'poniedziałek', mondayAt10)).toBe(
      false,
    )
  })

  it('returns false when the hours string has no separator', () => {
    expect(isOpeningSlotActive('900-1700', 'poniedziałek', mondayAt930)).toBe(
      false,
    )
  })

  it('returns false when the time values are not valid numbers', () => {
    expect(isOpeningSlotActive('abc-def', 'poniedziałek', mondayAt10)).toBe(
      false,
    )
  })

  it('returns false when only one part of the time range is present', () => {
    expect(isOpeningSlotActive('9:00-', 'poniedziałek', mondayAt10)).toBe(false)
    expect(isOpeningSlotActive('-17:00', 'poniedziałek', mondayAt10)).toBe(
      false,
    )
  })

  it('is case-insensitive for day comparison', () => {
    const snapshot = { currentDayName: 'poniedziałek', currentMinutes: 10 * 60 }
    expect(isOpeningSlotActive('9:00-17:00', 'Poniedziałek', snapshot)).toBe(
      true,
    )
  })
})

describe('isSalonOpenNow', () => {
  it('returns true when the current time falls within an opening slot', () => {
    // Wednesday 14:30 Warsaw time (2025-10-15T12:30:00Z, CEST = UTC+2)
    vi.setSystemTime(new Date('2025-10-15T12:30:00Z'))

    const openingHours: Record<string, string> = {
      poniedziałek: '9:00-17:00',
      wtorek: '9:00-17:00',
      środa: '9:00-17:00',
      czwartek: '9:00-17:00',
      piątek: '9:00-17:00',
      sobota: 'Zamknięte',
      niedziela: 'Zamknięte',
    }

    expect(isSalonOpenNow(openingHours)).toBe(true)

    vi.useRealTimers()
  })

  it('returns false when the current time is outside all opening slots', () => {
    // Wednesday 20:00 Warsaw time (2025-10-15T18:00:00Z)
    vi.setSystemTime(new Date('2025-10-15T18:00:00Z'))

    const openingHours: Record<string, string> = {
      poniedziałek: '9:00-17:00',
      środa: '9:00-17:00',
    }

    expect(isSalonOpenNow(openingHours)).toBe(false)

    vi.useRealTimers()
  })

  it('returns false on a closed day', () => {
    // Sunday 11:00 Warsaw time (2025-10-19T09:00:00Z)
    vi.setSystemTime(new Date('2025-10-19T09:00:00Z'))

    const openingHours: Record<string, string> = {
      poniedziałek: '9:00-17:00',
      niedziela: 'Zamknięte',
    }

    expect(isSalonOpenNow(openingHours)).toBe(false)

    vi.useRealTimers()
  })
})
