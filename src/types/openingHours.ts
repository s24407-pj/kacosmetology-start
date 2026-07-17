export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]
export type LocalTime = `${number}${number}:${number}${number}`

export interface OpeningSlot {
  readonly opens: LocalTime
  readonly closes: LocalTime
}

export type DailyOpeningHours =
  | { readonly status: 'closed' }
  | {
      readonly status: 'open'
      readonly slots: readonly [OpeningSlot, ...OpeningSlot[]]
    }

export interface OpeningSchedule {
  readonly timeZone: string
  readonly days: Readonly<Record<Weekday, DailyOpeningHours>>
}
