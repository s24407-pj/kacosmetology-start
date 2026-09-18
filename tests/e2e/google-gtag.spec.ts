import {
  ACCEPTED_CONSENT_SETTINGS,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_SETTINGS,
} from '@libs/consent/types'
import { expect, type Page, test } from '@playwright/test'
import { ready } from './helpers'

const GA_CONFIGURED = Boolean(process.env.VITE_GA_ID?.trim())
const GTAG_SRC_PREFIX = 'https://www.googletagmanager.com/gtag/js?id='

type WindowWithGtag = Window & {
  gtag?: (...args: unknown[]) => void
  dataLayer?: ArrayLike<unknown>[]
}

async function seedConsent(
  page: Page,
  settings: typeof DEFAULT_CONSENT_SETTINGS,
) {
  await page.addInitScript(
    ({ storageKey, version, nextSettings }) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          version,
          timestamp: '2020-01-01T00:00:00.000Z',
          settings: nextSettings,
        }),
      )
    },
    {
      storageKey: CONSENT_STORAGE_KEY,
      version: CONSENT_POLICY_VERSION,
      nextSettings: settings,
    },
  )
}

async function preventNavigationOnce(locator: ReturnType<Page['locator']>) {
  await locator.evaluate((el) => {
    el.addEventListener(
      'click',
      (event) => {
        event.preventDefault()
      },
      { once: true },
    )
  })
}

test.describe('Google Tag (Consent Mode v2)', () => {
  test('does not load Google Tag before consent', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop Google Tag smoke')

    await seedConsent(page, DEFAULT_CONSENT_SETTINGS)
    await ready(page, '/')

    await expect(
      page.locator('script[data-analytics-script="google-gtag"]'),
    ).toHaveCount(0)
    expect(
      await page.evaluate(() => typeof (window as WindowWithGtag).gtag),
    ).toBe('undefined')
  })

  test('loads gtag, orders consent update before config, and fires initial page_view on consent', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop Google Tag smoke')
    test.skip(
      !GA_CONFIGURED,
      'Set VITE_GA_ID to exercise Google Tag network events',
    )

    await seedConsent(page, ACCEPTED_CONSENT_SETTINGS)
    await ready(page, '/')

    const gtagScript = page.locator(
      'script[data-analytics-script="google-gtag"]',
    )
    await expect(gtagScript).toHaveCount(1)
    const src = await gtagScript.getAttribute('src')
    expect(src).toContain(GTAG_SRC_PREFIX)

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const win = window as WindowWithGtag
          if (!win.dataLayer || !Array.isArray(win.dataLayer)) {
            return 'missing-datalayer'
          }

          const entries = win.dataLayer.map((entry) =>
            Array.from(entry as ArrayLike<unknown>),
          )

          const defaultEntry = entries.find(
            (entry) => entry[0] === 'consent' && entry[1] === 'default',
          )
          const updateEntry = entries.find(
            (entry) => entry[0] === 'consent' && entry[1] === 'update',
          )
          const configEntry = entries.find((entry) => entry[0] === 'config')
          const pageViewEntry = entries.find(
            (entry) => entry[0] === 'event' && entry[1] === 'page_view',
          )

          if (!defaultEntry || !updateEntry || !configEntry || !pageViewEntry) {
            return 'incomplete-sequence'
          }

          const defaultParams = defaultEntry[2] as Record<string, unknown>
          const updateParams = updateEntry[2] as Record<string, unknown>

          const isRegionScoped =
            Array.isArray(defaultParams?.region) &&
            defaultParams.region.includes('PL')
          const isGranted =
            updateParams?.ad_user_data === 'granted' &&
            updateParams?.ad_personalization === 'granted' &&
            updateParams?.analytics_storage === 'granted'

          const updateIdx = entries.indexOf(updateEntry)
          const configIdx = entries.indexOf(configEntry)
          const pageViewIdx = entries.indexOf(pageViewEntry)

          const isOrdered = updateIdx < configIdx && configIdx < pageViewIdx

          return isRegionScoped && isGranted && isOrdered
            ? 'consent-mode-ready'
            : 'invalid-state'
        }),
      )
      .toBe('consent-mode-ready')

    // Exercise begin_checkout on Booksy CTA
    const booksyLink = page.locator('a[href*="booksy.com"]').first()
    await expect(booksyLink).toBeVisible()
    await preventNavigationOnce(booksyLink)
    await booksyLink.click()

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const win = window as WindowWithGtag
          const entries = (win.dataLayer ?? []).map((entry) =>
            Array.from(entry as ArrayLike<unknown>),
          )
          return entries.some(
            (entry) => entry[0] === 'event' && entry[1] === 'begin_checkout',
          )
        }),
      )
      .toBe(true)
  })
})
