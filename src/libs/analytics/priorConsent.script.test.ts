import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGoogleAdapter } from './adapters/google.adapter'
import { createMetaAdapter } from './adapters/meta.adapter'
import { createOpenAiAdapter } from './adapters/openai.adapter'
import { createAnalyticsFacadeForTests } from './index'
import type { AnalyticsAdapter } from './types'

function clearInjectedAnalyticsScripts() {
  for (const script of document.querySelectorAll(
    'script[data-analytics-script]',
  )) {
    script.remove()
  }

  Reflect.deleteProperty(window, 'gtag')
  Reflect.deleteProperty(window, 'dataLayer')
  Reflect.deleteProperty(window, 'fbq')
  Reflect.deleteProperty(window, '_fbq')
  Reflect.deleteProperty(window, 'oaiq')
}

function requireAdapter(
  adapter: AnalyticsAdapter | null,
  name: string,
): AnalyticsAdapter {
  expect(adapter, `${name} adapter should be created`).not.toBeNull()
  return adapter as AnalyticsAdapter
}

describe('Prior Consent script injection', () => {
  beforeEach(() => {
    clearInjectedAnalyticsScripts()
    sessionStorage.clear()
    window.history.replaceState({}, '', '/')
    vi.stubEnv('VITE_GA_ID', 'G-TEST123')
    vi.stubEnv('VITE_META_PIXEL_ID', '987654321')
    vi.stubEnv('VITE_OPENAI_PIXEL_ID', 'oai-test')
  })

  afterEach(() => {
    clearInjectedAnalyticsScripts()
    vi.unstubAllEnvs()
  })

  it('does not inject GA, Meta, or OpenAI scripts before updateConsent', () => {
    const google = requireAdapter(createGoogleAdapter(), 'google')
    const meta = requireAdapter(createMetaAdapter(), 'meta')
    const openai = requireAdapter(createOpenAiAdapter(), 'openai')

    const facade = createAnalyticsFacadeForTests([google, meta, openai])
    facade.init()

    expect(
      document.querySelector('script[data-analytics-script="google-gtag"]'),
    ).toBeNull()
    expect(
      document.querySelector('script[data-analytics-script="meta-pixel"]'),
    ).toBeNull()
    expect(
      document.querySelector('script[data-analytics-script="openai-pixel"]'),
    ).toBeNull()
  })

  it('injects only granted category scripts after updateConsent', () => {
    const google = requireAdapter(createGoogleAdapter(), 'google')
    const meta = requireAdapter(createMetaAdapter(), 'meta')
    const openai = requireAdapter(createOpenAiAdapter(), 'openai')

    const facade = createAnalyticsFacadeForTests([google, meta, openai])
    facade.init()
    facade.updateConsent({ analytics: true, marketing: false })

    const gtag = document.querySelector(
      'script[data-analytics-script="google-gtag"]',
    )
    expect(gtag).toBeInstanceOf(HTMLScriptElement)
    expect(gtag).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    )
    expect(
      document.querySelector('script[data-analytics-script="meta-pixel"]'),
    ).toBeNull()
    expect(
      document.querySelector('script[data-analytics-script="openai-pixel"]'),
    ).toBeNull()

    facade.updateConsent({ analytics: true, marketing: true })

    expect(
      document.querySelector('script[data-analytics-script="meta-pixel"]'),
    ).toHaveAttribute('src', 'https://connect.facebook.net/en_US/fbevents.js')
    expect(
      document.querySelector('script[data-analytics-script="openai-pixel"]'),
    ).toHaveAttribute('src', 'https://bzrcdn.openai.com/sdk/oaiq.min.js')
  })

  it('injects Google tag and marketing pixels on marketing-only consent', () => {
    const google = requireAdapter(createGoogleAdapter(), 'google')
    const meta = requireAdapter(createMetaAdapter(), 'meta')
    const openai = requireAdapter(createOpenAiAdapter(), 'openai')

    const facade = createAnalyticsFacadeForTests([google, meta, openai])
    facade.init()
    facade.updateConsent({ analytics: false, marketing: true })

    expect(
      document.querySelector('script[data-analytics-script="google-gtag"]'),
    ).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    )
    expect(
      document.querySelector('script[data-analytics-script="meta-pixel"]'),
    ).toHaveAttribute('src', 'https://connect.facebook.net/en_US/fbevents.js')
    expect(
      document.querySelector('script[data-analytics-script="openai-pixel"]'),
    ).toHaveAttribute('src', 'https://bzrcdn.openai.com/sdk/oaiq.min.js')

    const consentUpdate = window.dataLayer.find((entry) => {
      if (!entry || typeof entry !== 'object') {
        return false
      }
      const command = entry as ArrayLike<unknown>
      return command[0] === 'consent' && command[1] === 'update'
    })
    expect(consentUpdate).toBeTruthy()
    expect(Array.from(consentUpdate as ArrayLike<unknown>)).toEqual([
      'consent',
      'update',
      {
        analytics_storage: 'denied',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      },
    ])
  })
})
