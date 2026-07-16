import { describe, expect, it } from 'vitest'
import { resolveRenderTimeSnapshot } from './renderTime'

const HOST_TIME = new Date('2026-07-16T12:34:56.789Z')

describe('resolveRenderTimeSnapshot', () => {
  it('ignores a requested reference time when test mode is disabled', () => {
    expect(
      resolveRenderTimeSnapshot({
        now: HOST_TIME,
        requestedReferenceTime: '2025-09-15T12:00:00.000Z',
        allowReferenceTime: false,
      }),
    ).toEqual({
      mode: 'live',
      timestamp: HOST_TIME.toISOString(),
    })
  })

  it('returns live host time when no reference time is requested', () => {
    expect(
      resolveRenderTimeSnapshot({
        now: HOST_TIME,
        allowReferenceTime: true,
      }),
    ).toEqual({
      mode: 'live',
      timestamp: HOST_TIME.toISOString(),
    })
  })

  it('returns a normalized fixed snapshot for a UTC timestamp', () => {
    expect(
      resolveRenderTimeSnapshot({
        now: HOST_TIME,
        requestedReferenceTime: '2025-09-15T12:00:00Z',
        allowReferenceTime: true,
      }),
    ).toEqual({
      mode: 'fixed',
      timestamp: '2025-09-15T12:00:00.000Z',
    })
  })

  it('normalizes a fixed timestamp with a numeric UTC offset', () => {
    expect(
      resolveRenderTimeSnapshot({
        now: HOST_TIME,
        requestedReferenceTime: '2024-03-04T12:00:00+01:00',
        allowReferenceTime: true,
      }),
    ).toEqual({
      mode: 'fixed',
      timestamp: '2024-03-04T11:00:00.000Z',
    })
  })

  it.each([
    '2025-09-15',
    '2025-09-15T12:00:00',
    'not-a-date',
    '2025-13-40T25:61:61Z',
  ])('rejects invalid enabled reference time %s', (requestedReferenceTime) => {
    expect(() =>
      resolveRenderTimeSnapshot({
        now: HOST_TIME,
        requestedReferenceTime,
        allowReferenceTime: true,
      }),
    ).toThrow('__pwReferenceTime')
  })
})
