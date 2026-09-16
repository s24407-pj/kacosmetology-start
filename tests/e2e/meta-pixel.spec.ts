import {
  ACCEPTED_CONSENT_SETTINGS,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_SETTINGS,
} from '@libs/consent/types'
import { expect, type Page, type Request, test } from '@playwright/test'
import { ready } from './helpers'

const META_PIXEL_CONFIGURED = Boolean(process.env.VITE_META_PIXEL_ID?.trim())
const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js'

type WindowWithFbq = Window & {
  fbq?: ((...args: unknown[]) => void) & {
    queue?: { length: number; [index: number]: unknown }
    callMethod?: (...args: unknown[]) => void
  }
}

function requestBlob(request: Request): string {
  return `${request.url()}\n${request.postData() ?? ''}`
}

function isMetaPixelEvent(request: Request, eventName: string): boolean {
  const blob = requestBlob(request)
  return blob.includes('facebook.com/tr') && blob.includes(eventName)
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

test.describe('Meta Pixel', () => {
  test('does not load Meta before marketing consent', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop Meta Pixel smoke')

    await seedConsent(page, DEFAULT_CONSENT_SETTINGS)
    await ready(page, '/')

    await expect(
      page.locator('script[data-analytics-script="meta-pixel"]'),
    ).toHaveCount(0)
    expect(
      await page.evaluate(() => typeof (window as WindowWithFbq).fbq),
    ).toBe('undefined')
  })

  test('loads fbevents and fires PageView after marketing consent', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop Meta Pixel smoke')
    test.skip(
      !META_PIXEL_CONFIGURED,
      'Set VITE_META_PIXEL_ID to exercise Meta Pixel network events',
    )

    const fbeventsRequest = page.waitForRequest(
      (request) => request.url().startsWith(FBEVENTS_SRC),
      { timeout: 15_000 },
    )
    const pageViewPixel = page.waitForRequest(
      (request) => isMetaPixelEvent(request, 'PageView'),
      { timeout: 20_000 },
    )

    await seedConsent(page, ACCEPTED_CONSENT_SETTINGS)
    await ready(page, '/')

    await expect(
      page.locator('script[data-analytics-script="meta-pixel"]'),
    ).toHaveAttribute('src', FBEVENTS_SRC)

    await fbeventsRequest

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const fbq = (window as WindowWithFbq).fbq
          if (typeof fbq !== 'function') {
            return 'missing-fbq'
          }

          if (typeof fbq.callMethod === 'function') {
            return 'runtime-ready'
          }

          const queued = Array.from(
            { length: fbq.queue?.length ?? 0 },
            (_, index) =>
              Array.from(fbq.queue?.[index] as unknown as unknown[]),
          )
          const hasInit = queued.some(
            (entry) =>
              entry[0] === 'init' &&
              typeof entry[1] === 'string' &&
              entry[1].length > 0,
          )
          const hasPageView = queued.some(
            (entry) => entry[0] === 'track' && entry[1] === 'PageView',
          )
          return hasInit && hasPageView
            ? 'queued-init-pageview'
            : 'queue-incomplete'
        }),
      )
      .toMatch(/^(runtime-ready|queued-init-pageview)$/)

    await pageViewPixel
  })

  test('fires InitiateCheckout on Booksy CTA after marketing consent', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop Meta Pixel smoke')
    test.skip(
      !META_PIXEL_CONFIGURED,
      'Set VITE_META_PIXEL_ID to exercise Meta Pixel network events',
    )

    await seedConsent(page, ACCEPTED_CONSENT_SETTINGS)
    await ready(page, '/')

    await expect
      .poll(async () =>
        page.evaluate(() => typeof (window as WindowWithFbq).fbq),
      )
      .toBe('function')

    const initiateCheckout = page.waitForRequest(
      (request) => isMetaPixelEvent(request, 'InitiateCheckout'),
      { timeout: 20_000 },
    )

    const booksyLink = page.locator('a[href*="booksy.com"]').first()
    await expect(booksyLink).toBeVisible()
    await booksyLink.evaluate((el) => {
      el.addEventListener(
        'click',
        (event) => {
          event.preventDefault()
        },
        { once: true },
      )
    })
    await booksyLink.click()

    await initiateCheckout
  })
})
