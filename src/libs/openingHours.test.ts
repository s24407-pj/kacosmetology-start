import { type OpeningSchedule, WEEKDAYS } from '@app-types/openingHours'
import { contact } from '@data/contact'
import { describe, expect, it, vi } from 'vitest'

import {
  assertValidOpeningSchedule,
  defineOpeningSchedule,
  getCurrentOpeningSnapshot,
  getOpeningHoursView,
  isOpeningSlotActive,
  isSalonOpenNow,
  toSchemaOrgOpeningHoursSpecifications,
} from './openingHours'

const currentStructuredSchedule = {
  timeZone: 'Europe/Warsaw',
  days: {
    monday: { status: 'open', slots: [{ opens: '09:00', closes: '17:00' }] },
    tuesday: { status: 'open', slots: [{ opens: '09:00', closes: '17:00' }] },
    wednesday: {
      status: 'open',
      slots: [{ opens: '09:00', closes: '17:00' }],
    },
    thursday: { status: 'open', slots: [{ opens: '10:00', closes: '18:00' }] },
    friday: { status: 'open', slots: [{ opens: '10:00', closes: '18:00' }] },
    saturday: { status: 'open', slots: [{ opens: '09:00', closes: '14:00' }] },
    sunday: { status: 'closed' },
  },
} as const satisfies OpeningSchedule

const uncheckedSchedule = () => structuredClone(currentStructuredSchedule)

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
  it('uses an inclusive start and exclusive end for the configured Monday hours', () => {
    expect(
      isSalonOpenNow(
        contact.openingHours,
        new Date('2024-03-04T08:00:00.000Z'),
      ),
    ).toBe(true)
    expect(
      isSalonOpenNow(
        contact.openingHours,
        new Date('2024-03-04T16:00:00.000Z'),
      ),
    ).toBe(false)
  })

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

describe('validated weekly opening schedule', () => {
  it('defines all weekdays in deterministic Monday-to-Sunday order', () => {
    expect(WEEKDAYS).toEqual([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ])
    expect(defineOpeningSchedule(currentStructuredSchedule)).toBe(
      currentStructuredSchedule,
    )
  })

  it('rejects invalid schedule and weekday structure with actionable fields', () => {
    expect(() => assertValidOpeningSchedule(null)).toThrow('schedule')
    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        unexpected: true,
      }),
    ).toThrow('unexpected')
    expect(() =>
      assertValidOpeningSchedule({
        timeZone: 'Not/A_Timezone',
        days: uncheckedSchedule().days,
      }),
    ).toThrow('timeZone')

    const missingMonday = uncheckedSchedule()
    const { monday: _monday, ...daysWithoutMonday } = missingMonday.days
    expect(() =>
      assertValidOpeningSchedule({
        ...missingMonday,
        days: daysWithoutMonday,
      }),
    ).toThrow('monday')

    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        days: { ...uncheckedSchedule().days, someday: { status: 'closed' } },
      }),
    ).toThrow('someday')
  })

  it('rejects invalid daily states and slot cardinality', () => {
    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        days: {
          ...uncheckedSchedule().days,
          monday: { status: 'open', slots: [] },
        },
      }),
    ).toThrow('monday')
    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        days: {
          ...uncheckedSchedule().days,
          sunday: {
            status: 'closed',
            slots: [{ opens: '09:00', closes: '10:00' }],
          },
        },
      }),
    ).toThrow('sunday')
    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        days: {
          ...uncheckedSchedule().days,
          monday: { status: 'sometimes' },
        },
      }),
    ).toThrow('monday')
  })

  it.each([
    '9:00',
    '24:00',
    '09:60',
    'not-a-time',
  ])('rejects non-canonical clock text %s', (opens) => {
    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        days: {
          ...uncheckedSchedule().days,
          monday: {
            status: 'open',
            slots: [{ opens, closes: '17:00' }],
          },
        },
      }),
    ).toThrow('monday slot 0')
  })

  it.each([
    ['17:00', '17:00'],
    ['18:00', '17:00'],
    ['22:00', '02:00'],
  ])('rejects zero, reverse, and cross-midnight slot %s-%s', (opens, closes) => {
    expect(() =>
      assertValidOpeningSchedule({
        ...uncheckedSchedule(),
        days: {
          ...uncheckedSchedule().days,
          monday: { status: 'open', slots: [{ opens, closes }] },
        },
      }),
    ).toThrow('monday slot 0')
  })

  it('rejects unsorted and overlapping slots but allows adjacent slots', () => {
    const withMondaySlots = (slots: { opens: string; closes: string }[]) => ({
      ...uncheckedSchedule(),
      days: {
        ...uncheckedSchedule().days,
        monday: { status: 'open', slots },
      },
    })

    expect(() =>
      assertValidOpeningSchedule(
        withMondaySlots([
          { opens: '13:00', closes: '17:00' },
          { opens: '09:00', closes: '12:00' },
        ]),
      ),
    ).toThrow('monday slot 1')
    expect(() =>
      assertValidOpeningSchedule(
        withMondaySlots([
          { opens: '09:00', closes: '13:00' },
          { opens: '12:00', closes: '17:00' },
        ]),
      ),
    ).toThrow('monday slot 1')
    expect(() =>
      assertValidOpeningSchedule(
        withMondaySlots([
          { opens: '09:00', closes: '12:00' },
          { opens: '12:00', closes: '17:00' },
        ]),
      ),
    ).not.toThrow()
  })
})

describe('structured opening-hours projections', () => {
  it('preserves Warsaw winter, summer, DST, and slot boundaries', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-08T08:00:00.000Z'),
      ),
    ).toBe(true)
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-07-08T07:00:00.000Z'),
      ),
    ).toBe(true)
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-03-31T01:30:00.000Z'),
      ),
    ).toBe(false)
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-10-28T16:00:00.000Z'),
      ),
    ).toBe(false)
  })

  it('projects the exact current Polish UI rows and open state', () => {
    expect(
      getOpeningHoursView(
        currentStructuredSchedule,
        new Date('2024-03-04T11:00:00.000Z'),
      ),
    ).toEqual({
      isOpenNow: true,
      rows: [
        {
          weekday: 'monday',
          label: 'poniedziałek',
          hoursText: '09:00 - 17:00',
          isClosed: false,
          isToday: true,
          isActive: true,
        },
        {
          weekday: 'tuesday',
          label: 'wtorek',
          hoursText: '09:00 - 17:00',
          isClosed: false,
          isToday: false,
          isActive: false,
        },
        {
          weekday: 'wednesday',
          label: 'środa',
          hoursText: '09:00 - 17:00',
          isClosed: false,
          isToday: false,
          isActive: false,
        },
        {
          weekday: 'thursday',
          label: 'czwartek',
          hoursText: '10:00 - 18:00',
          isClosed: false,
          isToday: false,
          isActive: false,
        },
        {
          weekday: 'friday',
          label: 'piątek',
          hoursText: '10:00 - 18:00',
          isClosed: false,
          isToday: false,
          isActive: false,
        },
        {
          weekday: 'saturday',
          label: 'sobota',
          hoursText: '09:00 - 14:00',
          isClosed: false,
          isToday: false,
          isActive: false,
        },
        {
          weekday: 'sunday',
          label: 'niedziela',
          hoursText: 'Zamknięte',
          isClosed: true,
          isToday: false,
          isActive: false,
        },
      ],
    })
  })

  it('projects the exact current Schema.org entries', () => {
    expect(
      toSchemaOrgOpeningHoursSpecifications(currentStructuredSchedule),
    ).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Monday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Tuesday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Wednesday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Thursday',
        opens: '10:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: '10:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00',
      },
    ])
  })

  it('uses a changed timezone, closed day, and split slots in both projections', () => {
    const changedSchedule = defineOpeningSchedule({
      ...currentStructuredSchedule,
      timeZone: 'America/New_York',
      days: {
        ...currentStructuredSchedule.days,
        monday: {
          status: 'open',
          slots: [
            { opens: '09:30', closes: '12:00' },
            { opens: '13:00', closes: '17:30' },
          ],
        },
        tuesday: { status: 'closed' },
      },
    })

    const view = getOpeningHoursView(
      changedSchedule,
      new Date('2024-03-04T14:30:00.000Z'),
    )
    expect(view.isOpenNow).toBe(true)
    expect(view.rows[0]?.hoursText).toBe('09:30 - 12:00, 13:00 - 17:30')
    expect(view.rows[1]).toMatchObject({
      hoursText: 'Zamknięte',
      isClosed: true,
    })
    expect(toSchemaOrgOpeningHoursSpecifications(changedSchedule)).toEqual(
      expect.arrayContaining([
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Monday',
          opens: '09:30',
          closes: '12:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Monday',
          opens: '13:00',
          closes: '17:30',
        },
      ]),
    )
    expect(toSchemaOrgOpeningHoursSpecifications(changedSchedule)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dayOfWeek: 'Tuesday' }),
      ]),
    )
  })
})
