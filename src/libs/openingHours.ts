const TIME_ZONE = 'Europe/Warsaw'

export type OpeningSnapshot = {
  currentDayName: string
  currentMinutes: number
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }
  return hour * 60 + minute
}

export const getCurrentOpeningSnapshot = (
  date: Date = new Date(),
): OpeningSnapshot => {
  const currentDayName = new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    timeZone: TIME_ZONE,
  })
    .format(date)
    .toLowerCase()

  const [hour, minute] = new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: TIME_ZONE,
  })
    .format(date)
    .split(':')
    .map(Number)

  return {
    currentDayName,
    currentMinutes: hour * 60 + minute,
  }
}

export const isOpeningSlotActive = (
  hours: string,
  day: string,
  snapshot: OpeningSnapshot,
): boolean => {
  if (day.toLowerCase() !== snapshot.currentDayName || hours === 'Zamknięte') {
    return false
  }

  const [start, end] = hours.split('-').map((time) => time.trim())
  if (!start || !end) {
    return false
  }

  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)

  if (startMinutes === null || endMinutes === null) {
    return false
  }

  return (
    snapshot.currentMinutes >= startMinutes &&
    snapshot.currentMinutes < endMinutes
  )
}

export const isSalonOpenNow = (
  openingHours: Record<string, string>,
  date: Date = new Date(),
) => {
  const snapshot = getCurrentOpeningSnapshot(date)

  return Object.entries(openingHours).some(([day, hours]) =>
    isOpeningSlotActive(hours, day, snapshot),
  )
}
