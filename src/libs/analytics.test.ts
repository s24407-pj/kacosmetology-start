import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAnalyticsClient } from './analytics'

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
    vi.unstubAllGlobals()
    document
      .querySelectorAll('link[data-analytics-dns-prefetch]')
      .forEach((link) => {
        link.remove()
      })
  })

  it('does nothing in the test environment', async () => {
    const { initAnalytics, trackPlausibleEvent } =
      await importAnalyticsIn('test')

    expect(() => initAnalytics()).not.toThrow()
    expect(() =>
      trackPlausibleEvent('Test event', { source: 'test' }),
    ).not.toThrow()

    await Promise.resolve()

    expect(plausible.init).not.toHaveBeenCalled()
    expect(plausible.track).not.toHaveBeenCalled()
  })

  it('does nothing during server rendering', async () => {
    const { initAnalytics, trackPlausibleEvent } =
      await importAnalyticsIn('production')
    vi.stubGlobal('window', undefined)

    expect(() => initAnalytics()).not.toThrow()
    expect(() => trackPlausibleEvent('Server event')).not.toThrow()

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
    expect(plausible.init).toHaveBeenCalledWith({
      domain: 'kacosmetology.pl',
      endpoint: 'https://analytics.mflisik.ovh/api/event',
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

describe('analytics client lifecycle', () => {
  const createDeferredLoader = () => {
    let resolve: ((module: typeof plausible) => void) | undefined
    let reject: (() => void) | undefined
    const promise = new Promise<typeof plausible>(
      (resolvePromise, rejectPromise) => {
        resolve = resolvePromise
        reject = rejectPromise
      },
    )

    return {
      promise,
      resolve: () => resolve?.(plausible),
      reject: () => reject?.(),
    }
  }

  const createClient = (
    loadModule: () => Promise<typeof plausible>,
    warn = vi.fn(),
    prefetchDns = vi.fn(),
  ) => ({
    client: createAnalyticsClient({ loadModule, warn, prefetchDns }),
    prefetchDns,
    warn,
  })

  beforeEach(() => {
    plausible.init.mockReset()
    plausible.track.mockReset()
  })

  it('shares one in-flight import without consuming the retry', async () => {
    const deferred = createDeferredLoader()
    const loadModule = vi.fn(() => deferred.promise)
    const { client, warn } = createClient(loadModule)

    client.init()
    client.track('Concurrent event')
    await Promise.resolve()

    expect(loadModule).toHaveBeenCalledTimes(1)

    deferred.reject()
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledTimes(1)
    })

    expect(loadModule).toHaveBeenCalledTimes(1)
  })

  it('retries an import only on a later call and forwards that event', async () => {
    const loadError = new Error('private request detail')
    const loadModule = vi
      .fn<() => Promise<typeof plausible>>()
      .mockRejectedValueOnce(loadError)
      .mockResolvedValueOnce(plausible)
    const { client, warn, prefetchDns } = createClient(loadModule)

    client.track('Dropped event', { privateValue: 'do not log' })
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        '[analytics] Plausible failed to load; one later retry remains.',
      )
    })

    expect(loadModule).toHaveBeenCalledTimes(1)
    expect(plausible.track).not.toHaveBeenCalled()

    client.track('Retrying event', { placement: 'hero' })
    await vi.waitFor(() => {
      expect(plausible.track).toHaveBeenCalledWith('Retrying event', {
        props: { placement: 'hero' },
      })
    })

    expect(loadModule).toHaveBeenCalledTimes(2)
    expect(plausible.init).toHaveBeenCalledTimes(1)
    expect(prefetchDns).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining(loadError.message),
    )
  })

  it('disables analytics after the second import failure', async () => {
    const loadModule = vi
      .fn<() => Promise<typeof plausible>>()
      .mockRejectedValue(new Error('blocked analytics URL'))
    const { client, warn } = createClient(loadModule)

    client.init()
    await vi.waitFor(() => expect(warn).toHaveBeenCalledTimes(1))

    client.init()
    await vi.waitFor(() => expect(warn).toHaveBeenCalledTimes(2))

    client.init()
    client.track('Ignored event', { secret: 'not diagnostic data' })
    await Promise.resolve()

    expect(loadModule).toHaveBeenCalledTimes(2)
    expect(plausible.init).not.toHaveBeenCalled()
    expect(plausible.track).not.toHaveBeenCalled()
    expect(warn).toHaveBeenNthCalledWith(
      1,
      '[analytics] Plausible failed to load; one later retry remains.',
    )
    expect(warn).toHaveBeenNthCalledWith(
      2,
      '[analytics] Plausible failed to load after retry; analytics disabled.',
    )
  })

  it('treats an initialization exception as immediately terminal', async () => {
    plausible.init.mockImplementationOnce(() => {
      throw new Error('initialization detail')
    })
    const loadModule = vi
      .fn<() => Promise<typeof plausible>>()
      .mockResolvedValue(plausible)
    const { client, warn } = createClient(loadModule)

    expect(() => client.init()).not.toThrow()
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        '[analytics] Plausible initialization failed; analytics disabled.',
      )
    })

    client.init()
    client.track('Ignored after init failure')
    await Promise.resolve()

    expect(loadModule).toHaveBeenCalledTimes(1)
    expect(plausible.init).toHaveBeenCalledTimes(1)
    expect(plausible.track).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('emits no diagnostics after successful initialization', async () => {
    const loadModule = vi
      .fn<() => Promise<typeof plausible>>()
      .mockResolvedValue(plausible)
    const { client, warn, prefetchDns } = createClient(loadModule)

    client.init()
    client.track('Successful event')

    await vi.waitFor(() => {
      expect(plausible.track).toHaveBeenCalledTimes(1)
    })

    expect(loadModule).toHaveBeenCalledTimes(1)
    expect(plausible.init).toHaveBeenCalledTimes(1)
    expect(prefetchDns).toHaveBeenCalledTimes(1)
    expect(warn).not.toHaveBeenCalled()
  })
})
