import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useConsent } from './ConsentContext'
import { ConsentProvider } from './ConsentProvider'
import {
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_SETTINGS,
} from './types'

const updateConsent = vi.fn()

vi.mock('@libs/analytics', () => ({
  analytics: {
    updateConsent: (...args: unknown[]) => updateConsent(...args),
  },
}))

function ConsentProbe() {
  const {
    isReady,
    bannerOpen,
    preferencesOpen,
    settings,
    acceptAll,
    rejectAll,
    saveCustom,
    openSettings,
    closePreferences,
  } = useConsent()

  return (
    <div>
      <div data-testid="ready">{String(isReady)}</div>
      <div data-testid="banner">{String(bannerOpen)}</div>
      <div data-testid="preferences">{String(preferencesOpen)}</div>
      <div data-testid="analytics">{String(settings.analytics)}</div>
      <div data-testid="marketing">{String(settings.marketing)}</div>
      <button type="button" onClick={acceptAll}>
        accept-all
      </button>
      <button type="button" onClick={rejectAll}>
        reject-all
      </button>
      <button
        type="button"
        onClick={() =>
          saveCustom({
            necessary: true,
            analytics: true,
            marketing: false,
          })
        }
      >
        save-custom
      </button>
      <button type="button" onClick={openSettings}>
        open-settings
      </button>
      <button type="button" onClick={closePreferences}>
        close-preferences
      </button>
    </div>
  )
}

describe('ConsentProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    updateConsent.mockReset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('opens the banner when no consent is stored', async () => {
    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('banner')).toHaveTextContent('true')
    expect(updateConsent).not.toHaveBeenCalled()
  })

  it('applies stored consent and keeps the banner closed', async () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_POLICY_VERSION,
        timestamp: '2026-01-01T00:00:00.000Z',
        settings: {
          necessary: true,
          analytics: true,
          marketing: false,
        },
      }),
    )

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('banner')).toHaveTextContent('false')
    expect(screen.getByTestId('analytics')).toHaveTextContent('true')
    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: false,
    })
  })

  it('treats an outdated policy version as missing consent', async () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: '0.1',
        timestamp: '2026-01-01T00:00:00.000Z',
        settings: DEFAULT_CONSENT_SETTINGS,
      }),
    )

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('banner')).toHaveTextContent('true')
    })
    expect(updateConsent).not.toHaveBeenCalled()
  })

  it('acceptAll persists and calls updateConsent', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    await user.click(screen.getByRole('button', { name: 'accept-all' }))

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: true,
    })
    expect(screen.getByTestId('banner')).toHaveTextContent('false')
    expect(
      JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({
      version: CONSENT_POLICY_VERSION,
      settings: {
        necessary: true,
        analytics: true,
        marketing: true,
      },
    })
  })

  it('rejectAll persists optional categories as false', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    await user.click(screen.getByRole('button', { name: 'reject-all' }))

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: false,
      marketing: false,
    })
    expect(screen.getByTestId('banner')).toHaveTextContent('false')
  })

  it('saveCustom persists granular choices', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    await user.click(screen.getByRole('button', { name: 'save-custom' }))

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: false,
    })
  })

  it('openSettings and closePreferences toggle the preferences view', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    await user.click(screen.getByRole('button', { name: 'open-settings' }))
    expect(screen.getByTestId('preferences')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'close-preferences' }))
    expect(screen.getByTestId('preferences')).toHaveTextContent('false')
  })

  it('revokes previously granted consent without reloading', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })

    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_POLICY_VERSION,
        timestamp: '2026-01-01T00:00:00.000Z',
        settings: {
          necessary: true,
          analytics: true,
          marketing: true,
        },
      }),
    )

    render(
      <ConsentProvider>
        <ConsentProbe />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true')
    })

    updateConsent.mockClear()
    await user.click(screen.getByRole('button', { name: 'reject-all' }))

    expect(reload).not.toHaveBeenCalled()
    expect(updateConsent).toHaveBeenCalledWith({
      analytics: false,
      marketing: false,
    })
    expect(screen.getByTestId('analytics')).toHaveTextContent('false')

    vi.unstubAllGlobals()
  })
})
