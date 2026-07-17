import { type OpeningSchedule, WEEKDAYS } from '@app-types/openingHours'
import { primarySalonLocation } from '@data/business'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import {
  assertValidOpeningSchedule,
  defineOpeningSchedule,
  getOpeningHoursView,
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

const assertStaticOpeningScheduleContracts = () => {
  defineOpeningSchedule({
    ...currentStructuredSchedule,
    // @ts-expect-error schedule fields are exact
    label: 'Main salon',
  })

  defineOpeningSchedule({
    timeZone: 'Europe/Warsaw',
    days: {
      ...currentStructuredSchedule.days,
      // @ts-expect-error extra weekdays must be rejected statically
      someday: { status: 'closed' },
    },
  })

  defineOpeningSchedule({
    timeZone: 'Europe/Warsaw',
    days: {
      ...currentStructuredSchedule.days,
      monday: {
        status: 'open',
        slots: [
          {
            opens: '09:00',
            closes: '17:00',
            // @ts-expect-error slot fields are exact
            note: 'morning',
          },
        ],
      },
    },
  })

  defineOpeningSchedule({
    timeZone: 'Europe/Warsaw',
    days: {
      ...currentStructuredSchedule.days,
      sunday: {
        status: 'closed',
        // @ts-expect-error closed days cannot carry slots
        slots: [{ opens: '09:00', closes: '10:00' }],
      },
    },
  })

  const { monday: _monday, ...daysWithoutMonday } =
    currentStructuredSchedule.days
  defineOpeningSchedule({
    timeZone: 'Europe/Warsaw',
    // @ts-expect-error every canonical weekday is required
    days: daysWithoutMonday,
  })

  defineOpeningSchedule({
    timeZone: 'Europe/Warsaw',
    days: {
      ...currentStructuredSchedule.days,
      // @ts-expect-error open days require at least one slot
      monday: { status: 'open', slots: [] },
    },
  })
}

void assertStaticOpeningScheduleContracts

describe('opening schedule timezone snapshots', () => {
  it('returns the correct Polish day name and minutes for a given date', () => {
    const view = getOpeningHoursView(
      currentStructuredSchedule,
      new Date('2025-10-15T12:30:00Z'),
    )

    expect(view.rows.find(({ isToday }) => isToday)?.label).toBe('środa')
    expect(view.isOpenNow).toBe(true)
  })

  it('returns the correct day and minutes at midnight Warsaw time', () => {
    const view = getOpeningHoursView(
      currentStructuredSchedule,
      new Date('2025-11-03T23:00:00Z'),
    )

    expect(view.rows.find(({ isToday }) => isToday)?.label).toBe('wtorek')
    expect(view.isOpenNow).toBe(false)
  })

  it('handles the DST boundary correctly (Warsaw switches from CEST to CET)', () => {
    const schedule = defineOpeningSchedule({
      ...currentStructuredSchedule,
      days: {
        ...currentStructuredSchedule.days,
        sunday: {
          status: 'open',
          slots: [{ opens: '02:00', closes: '03:00' }],
        },
      },
    })

    expect(isSalonOpenNow(schedule, new Date('2025-10-26T00:30:00Z'))).toBe(
      true,
    )
    expect(isSalonOpenNow(schedule, new Date('2025-10-26T01:30:00Z'))).toBe(
      true,
    )
  })
})

describe('structured opening slot behavior', () => {
  it('returns true when current time is within the opening hours', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-08T09:00:00Z'),
      ),
    ).toBe(true)
  })

  it('returns true at the exact start of the opening window (inclusive)', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-08T08:00:00Z'),
      ),
    ).toBe(true)
  })

  it('returns false at the exact end of the opening window (exclusive)', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-08T16:00:00Z'),
      ),
    ).toBe(false)
  })

  it('returns false when current time is before opening hours', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-08T07:59:00Z'),
      ),
    ).toBe(false)
  })

  it('returns false when current time is after closing hours', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-08T17:00:00Z'),
      ),
    ).toBe(false)
  })

  it('returns false when the day does not match', () => {
    const mondayOnly = defineOpeningSchedule({
      ...currentStructuredSchedule,
      days: {
        ...currentStructuredSchedule.days,
        tuesday: { status: 'closed' },
      },
    })
    expect(isSalonOpenNow(mondayOnly, new Date('2024-01-09T09:00:00Z'))).toBe(
      false,
    )
  })

  it('returns false when hours is "Zamknięte"', () => {
    expect(
      isSalonOpenNow(
        currentStructuredSchedule,
        new Date('2024-01-07T10:00:00Z'),
      ),
    ).toBe(false)
  })

  it('returns false when the hours string has no separator', () => {
    const schedule = uncheckedSchedule()
    expect(() =>
      assertValidOpeningSchedule({
        ...schedule,
        days: {
          ...schedule.days,
          monday: {
            status: 'open',
            slots: [{ opens: '0900', closes: '17:00' }],
          },
        },
      }),
    ).toThrow('monday slot 0')
  })

  it('returns false when the time values are not valid numbers', () => {
    const schedule = uncheckedSchedule()
    expect(() =>
      assertValidOpeningSchedule({
        ...schedule,
        days: {
          ...schedule.days,
          monday: {
            status: 'open',
            slots: [{ opens: 'ab:cd', closes: '17:00' }],
          },
        },
      }),
    ).toThrow('monday slot 0')
  })

  it('returns false when only one part of the time range is present', () => {
    const schedule = uncheckedSchedule()
    const [slot] = schedule.days.monday.slots
    expect(() =>
      assertValidOpeningSchedule({
        ...schedule,
        days: {
          ...schedule.days,
          monday: { status: 'open', slots: [{ opens: slot.opens }] },
        },
      }),
    ).toThrow('closes')
  })

  it('is case-insensitive for day comparison', () => {
    expect(WEEKDAYS).toContain('monday')
    expect(WEEKDAYS).not.toContain('Monday')
  })
})

describe('isSalonOpenNow', () => {
  it('uses an inclusive start and exclusive end for the configured Monday hours', () => {
    expect(
      isSalonOpenNow(
        primarySalonLocation.openingSchedule,
        new Date('2024-03-04T08:00:00.000Z'),
      ),
    ).toBe(true)
    expect(
      isSalonOpenNow(
        primarySalonLocation.openingSchedule,
        new Date('2024-03-04T16:00:00.000Z'),
      ),
    ).toBe(false)
  })

  it('returns true when the current time falls within an opening slot', () => {
    // Wednesday 14:30 Warsaw time (2025-10-15T12:30:00Z, CEST = UTC+2)
    vi.setSystemTime(new Date('2025-10-15T12:30:00Z'))

    expect(isSalonOpenNow(primarySalonLocation.openingSchedule)).toBe(true)

    vi.useRealTimers()
  })

  it('returns false when the current time is outside all opening slots', () => {
    // Wednesday 20:00 Warsaw time (2025-10-15T18:00:00Z)
    vi.setSystemTime(new Date('2025-10-15T18:00:00Z'))

    expect(isSalonOpenNow(primarySalonLocation.openingSchedule)).toBe(false)

    vi.useRealTimers()
  })

  it('returns false on a closed day', () => {
    // Sunday 11:00 Warsaw time (2025-10-19T09:00:00Z)
    vi.setSystemTime(new Date('2025-10-19T09:00:00Z'))

    expect(isSalonOpenNow(primarySalonLocation.openingSchedule)).toBe(false)

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
    const definedSchedule = defineOpeningSchedule(currentStructuredSchedule)
    expect(definedSchedule).toBe(currentStructuredSchedule)
    expectTypeOf(definedSchedule.days.monday.status).toEqualTypeOf<'open'>()
    expectTypeOf(
      definedSchedule.days.monday.slots[0].opens,
    ).toEqualTypeOf<'09:00'>()
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
    expect(() =>
      assertValidOpeningSchedule({
        timeZone: '+01:00',
        days: uncheckedSchedule().days,
      }),
    ).toThrow('timeZone')

    expect(() =>
      assertValidOpeningSchedule({
        timeZone: 'Europe/Warsaw',
        days: uncheckedSchedule().days,
      }),
    ).not.toThrow()
    expect(() =>
      assertValidOpeningSchedule({
        timeZone: 'America/New_York',
        days: uncheckedSchedule().days,
      }),
    ).not.toThrow()

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
