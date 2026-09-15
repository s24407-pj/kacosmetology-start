import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ScheduleDeferredWorkDeps,
  scheduleDeferredWork,
} from './scheduleDeferredWork'

describe('scheduleDeferredWork', () => {
  const loadDeferredFonts = vi.fn().mockResolvedValue(undefined)

  let loadHandler: (() => void) | undefined
  let scrollHandler: (() => void) | undefined
  const timeouts = new Map<number, () => void>()
  let nextTimeoutId = 1

  const addEventListener = vi.fn(
    (
      event: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (
        event === 'load' &&
        options &&
        typeof options === 'object' &&
        options.once
      ) {
        loadHandler = handler as () => void
      }

      if (
        event === 'scroll' &&
        options &&
        typeof options === 'object' &&
        options.once
      ) {
        scrollHandler = handler as () => void
      }
    },
  )

  const setTimeout = vi.fn((handler: TimerHandler, ...args: unknown[]) => {
    void args
    const id = nextTimeoutId++

    if (typeof handler === 'function') {
      timeouts.set(id, handler as () => void)
    }

    return id
  })
  const removeEventListener = vi.fn()
  const clearTimeout = vi.fn((id: number | undefined) => {
    if (id !== undefined) {
      timeouts.delete(id)
    }
  })

  const createDeps = (
    overrides: Partial<ScheduleDeferredWorkDeps> = {},
  ): ScheduleDeferredWorkDeps => ({
    loadDeferredFonts,
    addEventListener,
    removeEventListener,
    documentReadyState: 'loading',
    setTimeout,
    clearTimeout,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    loadHandler = undefined
    scrollHandler = undefined
    timeouts.clear()
    nextTimeoutId = 1
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not load fonts synchronously', () => {
    scheduleDeferredWork(createDeps())

    expect(loadDeferredFonts).not.toHaveBeenCalled()
  })

  it('registers load and scroll listeners', () => {
    scheduleDeferredWork(createDeps())

    expect(addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      {
        passive: true,
        once: true,
      },
    )
    expect(addEventListener).toHaveBeenCalledWith(
      'load',
      expect.any(Function),
      { once: true },
    )
  })

  it('does not initialize analytics on load', () => {
    scheduleDeferredWork(createDeps())
    loadHandler?.()

    expect(loadDeferredFonts).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000)
  })

  it('loads deferred fonts on first scroll', () => {
    scheduleDeferredWork(createDeps())
    scrollHandler?.()

    expect(loadDeferredFonts).toHaveBeenCalledTimes(1)
  })

  it('loads deferred fonts after 4s fallback on load', () => {
    scheduleDeferredWork(createDeps())
    loadHandler?.()

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000)

    const fallbackCallback = timeouts.get(1)
    fallbackCallback?.()

    expect(loadDeferredFonts).toHaveBeenCalledTimes(1)
  })

  it('loads deferred fonts only once when scroll and fallback both fire', () => {
    scheduleDeferredWork(createDeps())
    scrollHandler?.()
    loadHandler?.()

    const fallbackCallback = timeouts.get(1)
    fallbackCallback?.()

    expect(loadDeferredFonts).toHaveBeenCalledTimes(1)
  })

  it('schedules font fallback immediately when hydration happens after load', () => {
    scheduleDeferredWork(createDeps({ documentReadyState: 'complete' }))

    expect(addEventListener).not.toHaveBeenCalledWith(
      'load',
      expect.any(Function),
      expect.anything(),
    )
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000)
  })

  it('removes listeners and cancels pending fallback work on cleanup', () => {
    const cleanup = scheduleDeferredWork(createDeps())
    loadHandler?.()

    cleanup()

    expect(removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    )
    expect(removeEventListener).toHaveBeenCalledWith(
      'load',
      expect.any(Function),
    )
    expect(clearTimeout).toHaveBeenCalledWith(1)
  })
})
