import {
  type DailyOpeningHours,
  type LocalTime,
  type OpeningSchedule,
  type OpeningSlot,
  WEEKDAYS,
  type Weekday,
} from '@app-types/openingHours'

const POLISH_WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'poniedziałek',
  tuesday: 'wtorek',
  wednesday: 'środa',
  thursday: 'czwartek',
  friday: 'piątek',
  saturday: 'sobota',
  sunday: 'niedziela',
}

const SCHEMA_ORG_WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const ENGLISH_WEEKDAYS: Record<string, Weekday> = {
  Monday: 'monday',
  Tuesday: 'tuesday',
  Wednesday: 'wednesday',
  Thursday: 'thursday',
  Friday: 'friday',
  Saturday: 'saturday',
  Sunday: 'sunday',
}

const LOCAL_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const IANA_TIME_ZONES = new Set(Intl.supportedValuesOf('timeZone'))

type WithoutExtraKeys<Value, Shape> = Value &
  Record<Exclude<keyof Value, keyof Shape>, never>

type ExactOpeningSlot<Slot extends OpeningSlot> = WithoutExtraKeys<
  Slot,
  OpeningSlot
>

type ExactOpeningSlots<Slots extends readonly [OpeningSlot, ...OpeningSlot[]]> =
  {
    readonly [Index in keyof Slots]: Slots[Index] extends OpeningSlot
      ? ExactOpeningSlot<Slots[Index]>
      : Slots[Index]
  }

type ExactDailyOpeningHours<Day extends DailyOpeningHours> = Day extends {
  readonly status: 'closed'
}
  ? WithoutExtraKeys<Day, { readonly status: 'closed' }>
  : Day extends {
        readonly status: 'open'
        readonly slots: infer Slots extends readonly [
          OpeningSlot,
          ...OpeningSlot[],
        ]
      }
    ? WithoutExtraKeys<
        Day,
        {
          readonly status: 'open'
          readonly slots: readonly [OpeningSlot, ...OpeningSlot[]]
        }
      > & {
        readonly slots: ExactOpeningSlots<Slots>
      }
    : never

type ExactOpeningDays<
  Days extends Readonly<Record<Weekday, DailyOpeningHours>>,
> = WithoutExtraKeys<Days, Readonly<Record<Weekday, DailyOpeningHours>>> & {
  readonly [Day in Weekday]: ExactDailyOpeningHours<Days[Day]>
}

type ExactOpeningSchedule<Schedule extends OpeningSchedule> = WithoutExtraKeys<
  Schedule,
  OpeningSchedule
> & {
  readonly days: ExactOpeningDays<Schedule['days']>
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const assertExactKeys = (
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
  path: string,
) => {
  const extraKey = Object.keys(value).find((key) => !expectedKeys.includes(key))
  if (extraKey) {
    throw new Error(`${path} contains unexpected key "${extraKey}"`)
  }

  const missingKey = expectedKeys.find((key) => !(key in value))
  if (missingKey) {
    throw new Error(`${path} is missing required key "${missingKey}"`)
  }
}

const parseCanonicalTime = (value: unknown, path: string): number => {
  if (typeof value !== 'string' || !LOCAL_TIME_PATTERN.test(value)) {
    throw new Error(`${path} must use canonical HH:mm local time`)
  }

  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export function assertValidOpeningSchedule(
  value: unknown,
): asserts value is OpeningSchedule {
  if (!isPlainObject(value)) {
    throw new Error('schedule must be a plain object')
  }

  assertExactKeys(value, ['timeZone', 'days'], 'schedule')

  if (typeof value.timeZone !== 'string') {
    throw new Error('schedule.timeZone must be an IANA timezone')
  }
  if (!IANA_TIME_ZONES.has(value.timeZone)) {
    throw new Error(
      `schedule.timeZone "${value.timeZone}" must be a supported IANA location timezone`,
    )
  }

  if (!isPlainObject(value.days)) {
    throw new Error('schedule.days must be a plain object')
  }
  assertExactKeys(value.days, WEEKDAYS, 'schedule.days')

  for (const weekday of WEEKDAYS) {
    const day = value.days[weekday]
    const dayPath = `schedule.days.${weekday}`
    if (!isPlainObject(day)) {
      throw new Error(`${dayPath} must be a plain object`)
    }
    if (day.status === 'closed') {
      assertExactKeys(day, ['status'], dayPath)
      continue
    }
    if (day.status !== 'open') {
      throw new Error(`${dayPath}.status must be "open" or "closed"`)
    }

    assertExactKeys(day, ['status', 'slots'], dayPath)
    if (!Array.isArray(day.slots) || day.slots.length === 0) {
      throw new Error(`${dayPath}.slots must contain at least one slot`)
    }

    let previousOpens = -1
    let previousCloses = -1
    for (const [index, slot] of day.slots.entries()) {
      const slotPath = `${weekday} slot ${index}`
      if (!isPlainObject(slot)) {
        throw new Error(`${slotPath} must be a plain object`)
      }
      assertExactKeys(slot, ['opens', 'closes'], slotPath)
      const opens = parseCanonicalTime(slot.opens, `${slotPath}.opens`)
      const closes = parseCanonicalTime(slot.closes, `${slotPath}.closes`)

      if (opens >= closes) {
        throw new Error(
          `${slotPath} must open before it closes on the same day`,
        )
      }
      if (opens < previousOpens) {
        throw new Error(`${slotPath} must be authored in ascending order`)
      }
      if (opens < previousCloses) {
        throw new Error(`${slotPath} overlaps the previous slot`)
      }
      previousOpens = opens
      previousCloses = closes
    }
  }
}

export const defineOpeningSchedule = <const Schedule extends OpeningSchedule>(
  schedule: ExactOpeningSchedule<Schedule>,
): Schedule => {
  assertValidOpeningSchedule(schedule)
  return schedule
}

type ScheduleSnapshot = {
  weekday: Weekday
  minuteOfDay: number
}

const getScheduleSnapshot = (
  schedule: OpeningSchedule,
  date: Date,
): ScheduleSnapshot => {
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: schedule.timeZone,
  })
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(
        ({ type }) =>
          type === 'weekday' || type === 'hour' || type === 'minute',
      )
      .map(({ type, value }) => [type, value]),
  )
  const weekday = ENGLISH_WEEKDAYS[parts.weekday ?? '']
  if (!weekday) {
    throw new Error('Unable to resolve schedule weekday')
  }

  return {
    weekday,
    minuteOfDay: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

const isStructuredSlotActive = (
  opens: LocalTime,
  closes: LocalTime,
  minuteOfDay: number,
) => {
  const opensAt = Number(opens.slice(0, 2)) * 60 + Number(opens.slice(3))
  const closesAt = Number(closes.slice(0, 2)) * 60 + Number(closes.slice(3))
  return minuteOfDay >= opensAt && minuteOfDay < closesAt
}

const isScheduleOpenAtSnapshot = (
  schedule: OpeningSchedule,
  snapshot: ScheduleSnapshot,
) => {
  const day = schedule.days[snapshot.weekday]
  return (
    day.status === 'open' &&
    day.slots.some(({ opens, closes }) =>
      isStructuredSlotActive(opens, closes, snapshot.minuteOfDay),
    )
  )
}

export const getOpeningHoursView = (
  schedule: OpeningSchedule,
  date: Date = new Date(),
) => {
  const snapshot = getScheduleSnapshot(schedule, date)

  return {
    isOpenNow: isScheduleOpenAtSnapshot(schedule, snapshot),
    rows: WEEKDAYS.map((weekday) => {
      const day = schedule.days[weekday]
      const isToday = weekday === snapshot.weekday
      const isActive =
        isToday &&
        day.status === 'open' &&
        day.slots.some(({ opens, closes }) =>
          isStructuredSlotActive(opens, closes, snapshot.minuteOfDay),
        )

      return {
        weekday,
        label: POLISH_WEEKDAY_LABELS[weekday],
        hoursText:
          day.status === 'closed'
            ? 'Zamknięte'
            : day.slots
                .map(({ opens, closes }) => `${opens} - ${closes}`)
                .join(', '),
        isClosed: day.status === 'closed',
        isToday,
        isActive,
      }
    }),
  }
}

export const toSchemaOrgOpeningHoursSpecifications = (
  schedule: OpeningSchedule,
) =>
  WEEKDAYS.flatMap((weekday) => {
    const day = schedule.days[weekday]
    if (day.status === 'closed') {
      return []
    }

    return day.slots.map(({ opens, closes }) => ({
      '@type': 'OpeningHoursSpecification' as const,
      dayOfWeek: SCHEMA_ORG_WEEKDAY_LABELS[weekday],
      opens,
      closes,
    }))
  })

export const isSalonOpenNow = (
  schedule: OpeningSchedule,
  date: Date = new Date(),
) => isScheduleOpenAtSnapshot(schedule, getScheduleSnapshot(schedule, date))
