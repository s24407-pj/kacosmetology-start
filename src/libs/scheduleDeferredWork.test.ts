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
    (event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'load') loadHandler = handler as () => void
      if (event === 'scroll') scrollHandler = handler as () => void
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

  const runPendingTimeouts = () => {
    for (const handler of timeouts.values()) handler()
  }

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

  it('loads deferred fonts on first scroll', () => {
    scheduleDeferredWork(createDeps())
    scrollHandler?.()

    expect(loadDeferredFonts).toHaveBeenCalledTimes(1)
  })

  it('loads deferred fonts after a 4s fallback once the page has loaded', () => {
    scheduleDeferredWork(createDeps())
    loadHandler?.()

    expect(loadDeferredFonts).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000)

    runPendingTimeouts()

    expect(loadDeferredFonts).toHaveBeenCalledTimes(1)
  })

  it('loads deferred fonts only once when scroll and fallback both fire', () => {
    scheduleDeferredWork(createDeps())
    scrollHandler?.()
    loadHandler?.()

    runPendingTimeouts()

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
    runPendingTimeouts()
    expect(loadDeferredFonts).not.toHaveBeenCalled()
  })
})
