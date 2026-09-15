import {
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  type ConsentCategorySettings,
  type StoredConsent,
} from './types'

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function isConsentCategorySettings(
  value: unknown,
): value is ConsentCategorySettings {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    candidate.necessary === true &&
    typeof candidate.analytics === 'boolean' &&
    typeof candidate.marketing === 'boolean'
  )
}

function isStoredConsent(value: unknown): value is StoredConsent {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.version === 'string' &&
    typeof candidate.timestamp === 'string' &&
    isConsentCategorySettings(candidate.settings)
  )
}

/** Returns current-version consent from localStorage, or null if absent/invalid/outdated. */
export function readStoredConsent(): StoredConsent | null {
  if (!isBrowser()) {
    return null
  }

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isStoredConsent(parsed)) {
      return null
    }

    if (parsed.version !== CONSENT_POLICY_VERSION) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writeStoredConsent(
  settings: ConsentCategorySettings,
): StoredConsent {
  const record: StoredConsent = {
    version: CONSENT_POLICY_VERSION,
    timestamp: new Date().toISOString(),
    settings: {
      necessary: true,
      analytics: settings.analytics,
      marketing: settings.marketing,
    },
  }

  if (isBrowser()) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
    } catch {
      // Quota / private mode: keep in-memory decision via caller state.
    }
  }

  return record
}
