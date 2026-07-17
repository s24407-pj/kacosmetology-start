import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const plausible = vi.hoisted(() => ({
  init: vi.fn(),
  track: vi.fn(),
}))

vi.mock('@plausible-analytics/tracker', () => plausible)

async function importAnalyticsIn(mode: string) {
  vi.stubEnv('MODE', mode)
  vi.resetModules()
  return import('./analytics')
}

describe('analytics', () => {
  beforeEach(() => {
    plausible.init.mockReset()
    plausible.track.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    document
      .querySelectorAll('link[data-analytics-dns-prefetch]')
      .forEach((link) => link.remove())
  })

  it('does nothing in the test environment', async () => {
    const { initAnalytics, trackPlausibleEvent } =
      await importAnalyticsIn('test')

    expect(() => initAnalytics()).not.toThrow()
    expect(() => trackPlausibleEvent('Test event', { source: 'test' })).not.toThrow()

    await Promise.resolve()

    expect(plausible.init).not.toHaveBeenCalled()
    expect(plausible.track).not.toHaveBeenCalled()
  })

  it('initializes Plausible once for repeated calls', async () => {
    const { initAnalytics } = await importAnalyticsIn('production')

    initAnalytics()
    initAnalytics()

    await vi.waitFor(() => {
      expect(plausible.init).toHaveBeenCalledTimes(1)
    })
  })

  it('shares initialization between concurrent tracking calls', async () => {
    const { trackPlausibleEvent } = await importAnalyticsIn('production')

    trackPlausibleEvent('First event')
    trackPlausibleEvent('Second event')

    await vi.waitFor(() => {
      expect(plausible.init).toHaveBeenCalledTimes(1)
      expect(plausible.track).toHaveBeenCalledTimes(2)
    })
  })

  it('waits for initialization and preserves the event property shape', async () => {
    const { trackPlausibleEvent } = await importAnalyticsIn('production')

    expect(() =>
      trackPlausibleEvent('Booking click', {
        placement: 'hero',
        available: true,
        position: 1,
      }),
    ).not.toThrow()
    expect(plausible.track).not.toHaveBeenCalled()

    await vi.waitFor(() => {
      expect(plausible.track).toHaveBeenCalledWith('Booking click', {
        props: {
          placement: 'hero',
          available: true,
          position: 1,
        },
      })
    })
  })
})
