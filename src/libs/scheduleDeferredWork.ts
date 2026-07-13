import { initAnalytics } from '@libs/analytics'
import { loadDeferredFonts } from '@libs/loadDeferredFonts'

const FONT_LOAD_FALLBACK_MS = 4000

export type ScheduleDeferredWorkDeps = {
  initAnalytics: typeof initAnalytics
  loadDeferredFonts: typeof loadDeferredFonts
  addEventListener: typeof window.addEventListener
  removeEventListener: typeof window.removeEventListener
  documentReadyState: DocumentReadyState
  setTimeout: (
    handler: TimerHandler,
    timeout?: number,
    ...restArguments: unknown[]
  ) => number
  clearTimeout: (id: number | undefined) => void
  requestIdleCallback?: typeof window.requestIdleCallback
  cancelIdleCallback?: typeof window.cancelIdleCallback
}

const getDefaultDeps = (): ScheduleDeferredWorkDeps => ({
  initAnalytics,
  loadDeferredFonts,
  addEventListener: window.addEventListener.bind(window),
  removeEventListener: window.removeEventListener.bind(window),
  documentReadyState: document.readyState,
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),
  requestIdleCallback: window.requestIdleCallback?.bind(window),
  cancelIdleCallback: window.cancelIdleCallback?.bind(window),
})

function runWhenIdle(deps: ScheduleDeferredWorkDeps, callback: () => void) {
  if (deps.requestIdleCallback) {
    return { idle: true, id: deps.requestIdleCallback(callback) }
  }

  return { idle: false, id: deps.setTimeout(callback, 1) }
}

export function scheduleDeferredWork(
  deps: ScheduleDeferredWorkDeps = getDefaultDeps(),
) {
  let fontsScheduled = false
  let loadWorkScheduled = false
  let fontTimeoutId: number | undefined
  let idleWork: ReturnType<typeof runWhenIdle> | undefined

  const scheduleFonts = () => {
    if (fontsScheduled) {
      return
    }

    fontsScheduled = true
    void deps.loadDeferredFonts()
  }

  const scheduleLoadWork = () => {
    if (loadWorkScheduled) {
      return
    }

    loadWorkScheduled = true
    idleWork = runWhenIdle(deps, () => deps.initAnalytics())
    fontTimeoutId = deps.setTimeout(scheduleFonts, FONT_LOAD_FALLBACK_MS)
  }

  deps.addEventListener('scroll', scheduleFonts, { passive: true, once: true })

  if (deps.documentReadyState === 'complete') {
    scheduleLoadWork()
  } else {
    deps.addEventListener('load', scheduleLoadWork, { once: true })
  }

  return () => {
    deps.removeEventListener('scroll', scheduleFonts)
    deps.removeEventListener('load', scheduleLoadWork)
    if (fontTimeoutId !== undefined) {
      deps.clearTimeout(fontTimeoutId)
    }
    if (idleWork?.idle) {
      deps.cancelIdleCallback?.(idleWork.id)
    } else if (idleWork) {
      deps.clearTimeout(idleWork.id)
    }
  }
}
