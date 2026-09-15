import { analytics } from '@libs/analytics'
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ConsentContext } from './ConsentContext'
import { readStoredConsent, writeStoredConsent } from './storage'
import {
  ACCEPTED_CONSENT_SETTINGS,
  type ConsentCategorySettings,
  DEFAULT_CONSENT_SETTINGS,
} from './types'

function applyToAnalytics(settings: ConsentCategorySettings) {
  analytics.updateConsent({
    analytics: settings.analytics,
    marketing: settings.marketing,
  })
}

export function ConsentProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [settings, setSettings] = useState<ConsentCategorySettings>(
    DEFAULT_CONSENT_SETTINGS,
  )
  const [draftSettings, setDraftSettings] = useState<ConsentCategorySettings>(
    DEFAULT_CONSENT_SETTINGS,
  )

  useEffect(() => {
    const stored = readStoredConsent()

    if (stored) {
      setSettings(stored.settings)
      setDraftSettings(stored.settings)
      setBannerOpen(false)
      applyToAnalytics(stored.settings)
    } else {
      setSettings(DEFAULT_CONSENT_SETTINGS)
      setDraftSettings(DEFAULT_CONSENT_SETTINGS)
      setBannerOpen(true)
    }

    setIsReady(true)
  }, [])

  const persistDecision = useCallback((next: ConsentCategorySettings) => {
    writeStoredConsent(next)
    setSettings(next)
    setDraftSettings(next)
    setBannerOpen(false)
    setPreferencesOpen(false)
    applyToAnalytics(next)
  }, [])

  const acceptAll = useCallback(() => {
    persistDecision(ACCEPTED_CONSENT_SETTINGS)
  }, [persistDecision])

  const rejectAll = useCallback(() => {
    persistDecision(DEFAULT_CONSENT_SETTINGS)
  }, [persistDecision])

  const saveCustom = useCallback(
    (next: ConsentCategorySettings) => {
      persistDecision({
        necessary: true,
        analytics: next.analytics,
        marketing: next.marketing,
      })
    },
    [persistDecision],
  )

  const openSettings = useCallback(() => {
    setDraftSettings(settings)
    setPreferencesOpen(true)
  }, [settings])

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false)
    setDraftSettings(settings)
  }, [settings])

  const value = useMemo(
    () => ({
      isReady,
      bannerOpen,
      preferencesOpen,
      settings,
      draftSettings,
      setDraftSettings,
      acceptAll,
      rejectAll,
      saveCustom,
      openSettings,
      closePreferences,
    }),
    [
      isReady,
      bannerOpen,
      preferencesOpen,
      settings,
      draftSettings,
      acceptAll,
      rejectAll,
      saveCustom,
      openSettings,
      closePreferences,
    ],
  )

  return <ConsentContext value={value}>{children}</ConsentContext>
}
