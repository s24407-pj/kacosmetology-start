import { loadDeferredFonts } from '@libs/loadDeferredFonts'

const FONT_LOAD_FALLBACK_MS = 4000

export type ScheduleDeferredWorkDeps = {
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
}

const getDefaultDeps = (): ScheduleDeferredWorkDeps => ({
  loadDeferredFonts,
  addEventListener: window.addEventListener.bind(window),
  removeEventListener: window.removeEventListener.bind(window),
  documentReadyState: document.readyState,
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),
})

export function scheduleDeferredWork(
  deps: ScheduleDeferredWorkDeps = getDefaultDeps(),
) {
  let fontsScheduled = false
  let loadWorkScheduled = false
  let fontTimeoutId: number | undefined

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
  }
}
