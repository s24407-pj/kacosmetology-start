import { analytics } from '@libs/analytics'
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

/**
 * Bootstraps the analytics facade on the client and tracks SPA page views
 * with hydration-safe path deduplication.
 */
export function AnalyticsBootstrap() {
  const path = useRouterState({ select: (state) => state.location.pathname })
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    analytics.init()
  }, [])

  useEffect(() => {
    if (lastTrackedPath.current === path) {
      return
    }

    lastTrackedPath.current = path
    analytics.trackPageView({
      path,
      title: typeof document !== 'undefined' ? document.title : undefined,
    })
  }, [path])

  return null
}
