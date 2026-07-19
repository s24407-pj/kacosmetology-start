import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatDuration, scrollToTop } from './utils'

describe('formatDuration', () => {
  it('returns minutes for durations under an hour', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(0)).toBe('0 min')
  })

  it('returns only hours when there are no remaining minutes', () => {
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(180)).toBe('3 h')
  })

  it('combines hours and minutes when needed', () => {
    expect(formatDuration(90)).toBe('1 h 30 min')
    expect(formatDuration(125)).toBe('2 h 5 min')
  })
})

describe('scroll helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('smoothly scrolls to the top of the page', () => {
    const scrollToSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {})

    scrollToTop()

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('uses an instant scroll when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })
    const scrollToSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {})

    scrollToTop()

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
