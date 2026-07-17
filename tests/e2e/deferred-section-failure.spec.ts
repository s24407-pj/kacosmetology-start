import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

const effectsChunkPattern =
  /^\/assets\/EffectsGallerySection-[^/]+\.js(?:\?.*)?$/

async function injectEffectsChunkFailure(page: Page) {
  let matchedRequests = 0

  await page.route('**/assets/EffectsGallerySection-*.js', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    if (!effectsChunkPattern.test(pathname)) {
      await route.continue()
      return
    }

    matchedRequests += 1
    if (matchedRequests === 1) {
      await route.abort('connectionreset')
      return
    }

    await route.continue()
  })

  return () => matchedRequests
}

async function openContainedEffectsFailure(page: Page) {
  const getMatchedRequests = await injectEffectsChunkFailure(page)
  await page.goto('/')

  await expect.poll(getMatchedRequests).toBe(1)
  const homePage = new HomePage(page)
  const failureAlert =
    homePage.getDeferredSectionFailureAlert('Efekty zabiegów')

  await expect(failureAlert).toBeVisible()
  await expect(homePage.heroHeading).toBeVisible()
  await expect(homePage.services.section).toBeAttached()
  await expect(homePage.effects.section).toBeAttached()
  await expect(homePage.gallery.section).toBeAttached()
  await expect(homePage.opinions.section).toBeAttached()
  await expect(homePage.contact.section).toBeAttached()
  await expect(homePage.mapFrame).toBeAttached()
  for (const sectionLabel of ['Galeria', 'Opinie', 'Kontakt', 'Mapa dojazdu']) {
    await expect(
      homePage.getDeferredSectionFailureAlert(sectionLabel),
    ).toHaveCount(0)
  }

  return { failureAlert, getMatchedRequests, homePage }
}

async function expectNoSeriousA11yViolations(page: Page) {
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }

      .animate-on-scroll {
        opacity: 1 !important;
        transform: none !important;
      }
    `
    document.head.append(style)
  })

  const accessibilityResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(
    accessibilityResults.violations.filter(
      (violation) => violation.impact !== 'minor',
    ),
  ).toEqual([])
}

test('contains a deferred chunk failure within the affected section', async ({
  page,
}) => {
  await openContainedEffectsFailure(page)
  await expectNoSeriousA11yViolations(page)
})

test('recovers the deferred section after a user reload', async ({ page }) => {
  test.skip(
    test.info().project.name === 'Mobile Safari',
    'Playwright WebKit retains a synthetically rejected module across reloads',
  )

  const { failureAlert, getMatchedRequests, homePage } =
    await openContainedEffectsFailure(page)

  await Promise.all([
    page.waitForNavigation(),
    homePage.getDeferredSectionReloadButton('Efekty zabiegów').click(),
  ])
  await homePage.waitUntilReady()

  await expect(homePage.effects.getHeading()).toBeVisible()
  await expect.poll(getMatchedRequests).toBe(2)
  await expect(failureAlert).toHaveCount(0)
})
