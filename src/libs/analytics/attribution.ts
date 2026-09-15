import type { AttributionContext } from './types'

const ATTRIBUTION_STORAGE_KEY = 'analytics.attribution'

const ATTRIBUTION_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const satisfies ReadonlyArray<keyof AttributionContext>

function isBrowser() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

function readStoredAttribution(): AttributionContext {
  if (!isBrowser()) {
    return {}
  }

  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return parsed as AttributionContext
  } catch {
    return {}
  }
}

function writeStoredAttribution(context: AttributionContext) {
  if (!isBrowser()) {
    return
  }

  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(context))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function mergeAttribution(
  existing: AttributionContext,
  incoming: AttributionContext,
): AttributionContext {
  const merged: AttributionContext = { ...existing }

  for (const [key, value] of Object.entries(incoming) as Array<
    [keyof AttributionContext, string | undefined]
  >) {
    if (typeof value === 'string' && value.length > 0) {
      merged[key] = value
    }
  }

  return merged
}

/** Capture campaign params into sessionStorage. Client-only; no-ops on SSR. */
export function captureAttribution(): void {
  if (!isBrowser()) {
    return
  }

  const params = new URLSearchParams(window.location.search)
  const incoming: AttributionContext = {}

  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const value = params.get(key)
    if (value) {
      incoming[key] = value
    }
  }

  if (document.referrer) {
    incoming.referrer = document.referrer
  }

  const hasIncoming = Object.keys(incoming).length > 0
  if (!hasIncoming) {
    return
  }

  writeStoredAttribution(mergeAttribution(readStoredAttribution(), incoming))
}

/** Read current session attribution for event payloads. Client-only. */
export function getAttributionContext(): AttributionContext {
  return readStoredAttribution()
}
