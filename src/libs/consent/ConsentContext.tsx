import { createContext, use } from 'react'
import type { ConsentCategorySettings } from './types'

export type ConsentContextValue = {
  isReady: boolean
  bannerOpen: boolean
  preferencesOpen: boolean
  settings: ConsentCategorySettings
  draftSettings: ConsentCategorySettings
  setDraftSettings: (settings: ConsentCategorySettings) => void
  acceptAll: () => void
  rejectAll: () => void
  saveCustom: (settings: ConsentCategorySettings) => void
  openSettings: () => void
  closePreferences: () => void
}

export const ConsentContext = createContext<ConsentContextValue | undefined>(
  undefined,
)

export function useConsent() {
  const context = use(ConsentContext)
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}
