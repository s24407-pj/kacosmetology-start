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
  _fbq?: (...args: unknown[]) => void
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

  test('fires PageView, Lead, InitiateCheckout, Purchase without version conflicts', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop Meta Pixel smoke')
    test.skip(
      !META_PIXEL_CONFIGURED,
      'Set VITE_META_PIXEL_ID to exercise Meta Pixel network events',
    )

    const metaWarnings: string[] = []
    page.on('console', (message) => {
      const text = message.text()
      if (/\[Meta Pixel\]/i.test(text)) {
        metaWarnings.push(text)
      }
    })

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
    await pageViewPixel

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const win = window as WindowWithFbq
          return typeof win.fbq === 'function' && win.fbq === win._fbq
            ? 'alias-ok'
            : 'alias-mismatch'
        }),
      )
      .toBe('alias-ok')

    const leadPixel = page.waitForRequest(
      (request) => isMetaPixelEvent(request, 'Lead'),
      { timeout: 20_000 },
    )
    const phoneLink = page.getByRole('link', { name: /Zadzwoń pod numer/i })
    await expect(phoneLink).toBeVisible()
    await preventNavigationOnce(phoneLink)
    await phoneLink.click()
    await leadPixel

    const initiateCheckout = page.waitForRequest(
      (request) => isMetaPixelEvent(request, 'InitiateCheckout'),
      { timeout: 20_000 },
    )
    const booksyLink = page.locator('a[href*="booksy.com"]').first()
    await expect(booksyLink).toBeVisible()
    await preventNavigationOnce(booksyLink)
    await booksyLink.click()
    await initiateCheckout

    // No in-app Purchase caller (Booksy checkout is external); exercise Meta track path.
    const purchasePixel = page.waitForRequest(
      (request) => isMetaPixelEvent(request, 'Purchase'),
      { timeout: 20_000 },
    )
    await page.evaluate(() => {
      const fbq = (window as WindowWithFbq).fbq
      fbq?.('track', 'Purchase', {
        value: 180,
        currency: 'PLN',
        content_category: 'permanent-makeup',
        order_id: 'e2e-meta-purchase',
      })
    })
    await purchasePixel

    expect(
      metaWarnings.filter((text) => /conflicting versions/i.test(text)),
    ).toEqual([])
  })
})
