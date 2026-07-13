import { describe, expect, it } from 'vitest'

import { pluralizeOpinie } from './pluralize'

describe('pluralizeOpinie', () => {
  it('returns singular for 1', () => {
    expect(pluralizeOpinie(1)).toBe('opinia')
  })

  it('returns genitive plural for compound numbers ending in 1', () => {
    expect(pluralizeOpinie(21)).toBe('opinii')
    expect(pluralizeOpinie(31)).toBe('opinii')
    expect(pluralizeOpinie(101)).toBe('opinii')
  })

  it('returns nominative plural for 2, 3 and 4 endings', () => {
    expect(pluralizeOpinie(2)).toBe('opinie')
    expect(pluralizeOpinie(4)).toBe('opinie')
    expect(pluralizeOpinie(22)).toBe('opinie')
    expect(pluralizeOpinie(123)).toBe('opinie')
    expect(pluralizeOpinie(144)).toBe('opinie')
  })

  it('returns genitive plural for teens and other numbers', () => {
    expect(pluralizeOpinie(5)).toBe('opinii')
    expect(pluralizeOpinie(11)).toBe('opinii')
    expect(pluralizeOpinie(12)).toBe('opinii')
    expect(pluralizeOpinie(14)).toBe('opinii')
    expect(pluralizeOpinie(100)).toBe('opinii')
  })
})
