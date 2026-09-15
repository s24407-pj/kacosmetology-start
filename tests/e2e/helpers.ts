import {
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_SETTINGS,
} from '@libs/consent/types'
import { expect, type Locator, type Page } from '@playwright/test'

/** Seed necessary-only consent so the cookie banner does not intercept clicks. */
export async function seedConsent(page: Page) {
  await page.addInitScript(
    ({ storageKey, version, settings }) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          version,
          timestamp: '2020-01-01T00:00:00.000Z',
          settings,
        }),
      )
    },
    {
      storageKey: CONSENT_STORAGE_KEY,
      version: CONSENT_POLICY_VERSION,
      settings: DEFAULT_CONSENT_SETTINGS,
    },
  )
}

export async function ready(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute(
    'data-react-client-ready',
    'true',
  )

  const promoClose = page.getByRole('button', {
    name: 'Zamknij baner promocji',
  })
  if ((await promoClose.count()) > 0) {
    await promoClose.click()
  }
}

/**
 * Scroll mid-viewport and wait for CSS-reveal settle before clicking so sticky
 * chrome and reveal transforms do not fail Playwright actionability.
 */
export async function clickSettled(locator: Locator) {
  const revealRoot = locator.locator(
    'xpath=ancestor-or-self::*[@data-reveal-on-scroll][1]',
  )
  await locator.evaluate((el) => {
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
  })
  if ((await revealRoot.count()) > 0) {
    await expect(revealRoot).toHaveAttribute('data-revealed')
    await expect
      .poll(async () =>
        revealRoot.evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('1')
  }
  await locator.click()
}
