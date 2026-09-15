export { useConsent } from './ConsentContext'
export { ConsentProvider } from './ConsentProvider'
export { readStoredConsent, writeStoredConsent } from './storage'
export {
  ACCEPTED_CONSENT_SETTINGS,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  type ConsentCategorySettings,
  DEFAULT_CONSENT_SETTINGS,
  type StoredConsent,
} from './types'
