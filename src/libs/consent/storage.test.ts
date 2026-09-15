import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readStoredConsent, writeStoredConsent } from './storage'
import {
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_SETTINGS,
} from './types'

describe('consent storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('writes and reads a current-version consent record', () => {
    const written = writeStoredConsent({
      necessary: true,
      analytics: true,
      marketing: false,
    })

    expect(written.version).toBe(CONSENT_POLICY_VERSION)
    expect(written.settings).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    })
    expect(readStoredConsent()).toEqual(written)
  })

  it('returns null for a mismatched policy version', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: '0.9',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: DEFAULT_CONSENT_SETTINGS,
      }),
    )

    expect(readStoredConsent()).toBeNull()
  })

  it('returns null for invalid JSON or shape', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, '{not-json')
    expect(readStoredConsent()).toBeNull()

    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: CONSENT_POLICY_VERSION, timestamp: 'x' }),
    )
    expect(readStoredConsent()).toBeNull()
  })

  it('returns null when localStorage is unavailable', () => {
    const original = window.localStorage
    vi.stubGlobal('localStorage', undefined)

    expect(readStoredConsent()).toBeNull()

    vi.stubGlobal('localStorage', original)
  })
})
