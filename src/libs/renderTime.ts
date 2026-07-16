export const PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY = '__pwReferenceTime'

export type RenderTimeSnapshot =
  | { mode: 'live'; timestamp: string }
  | { mode: 'fixed'; timestamp: string }

interface ResolveRenderTimeSnapshotOptions {
  now: Date
  requestedReferenceTime?: string
  allowReferenceTime: boolean
}

const COMPLETE_ISO_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|([+-])(\d{2}):(\d{2}))$/

function isValidCompleteIsoTimestamp(timestamp: string) {
  const match = COMPLETE_ISO_TIMESTAMP.exec(timestamp)

  if (!match) {
    return false
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second,
    ,
    ,
    ,
    offsetHour,
    offsetMinute,
  ] = match
  const numericYear = Number(year)
  const numericMonth = Number(month)
  const numericDay = Number(day)
  const daysInMonth = new Date(
    Date.UTC(numericYear, numericMonth, 0),
  ).getUTCDate()

  return (
    numericMonth >= 1 &&
    numericMonth <= 12 &&
    numericDay >= 1 &&
    numericDay <= daysInMonth &&
    Number(hour) <= 23 &&
    Number(minute) <= 59 &&
    Number(second) <= 59 &&
    (offsetHour === undefined ||
      (Number(offsetHour) <= 23 && Number(offsetMinute) <= 59))
  )
}

export function resolveRenderTimeSnapshot({
  now,
  requestedReferenceTime,
  allowReferenceTime,
}: ResolveRenderTimeSnapshotOptions): RenderTimeSnapshot {
  if (!allowReferenceTime || requestedReferenceTime === undefined) {
    return {
      mode: 'live',
      timestamp: now.toISOString(),
    }
  }

  if (!isValidCompleteIsoTimestamp(requestedReferenceTime)) {
    throw new Error(
      `Invalid ${PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY}: expected a complete ISO timestamp with an explicit timezone`,
    )
  }

  const parsedTimestamp = new Date(requestedReferenceTime)

  if (Number.isNaN(parsedTimestamp.getTime())) {
    throw new Error(
      `Invalid ${PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY}: timestamp cannot be parsed`,
    )
  }

  return {
    mode: 'fixed',
    timestamp: parsedTimestamp.toISOString(),
  }
}
