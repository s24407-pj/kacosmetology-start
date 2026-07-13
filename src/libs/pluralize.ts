export function pluralizeOpinie(count: number): string {
  if (count === 1) return 'opinia'

  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) return 'opinii'

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return 'opinie'
  }

  return 'opinii'
}
