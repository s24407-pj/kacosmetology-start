export const CONSENT_POLICY_VERSION = '1.1'
export const CONSENT_STORAGE_KEY = 'kacosmetology.consent'

export interface ConsentCategorySettings {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export interface StoredConsent {
  version: string
  timestamp: string
  settings: ConsentCategorySettings
}

export const DEFAULT_CONSENT_SETTINGS: ConsentCategorySettings = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export const ACCEPTED_CONSENT_SETTINGS: ConsentCategorySettings = {
  necessary: true,
  analytics: true,
  marketing: true,
}
