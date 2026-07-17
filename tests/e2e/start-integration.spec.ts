import { brand, primarySalonLocation } from '@data/business'
import { toBeautySalonJsonLd } from '@libs/businessMetadata'
import { expect, test } from '@playwright/test'
import { SEPTEMBER_PROMOTION_DATE } from './utils/dates'
import { homepageUrlAt } from './utils/referenceTime'

const SEPTEMBER_PROMOTION_MESSAGE =
  'Promocja! - wszystkie zabiegi przez cały wrzesień.'

test.describe('TanStack Start integration', () => {
  test('server-renders critical homepage content and SEO metadata', async ({
    request,
  }) => {
    const response = await request.get('/')
    expect(response.ok()).toBe(true)

    const html = await response.text()
    expect(html).toContain(brand.practitionerName)
    expect(html).toContain('O mnie')
    expect(html).toContain('Jak wygląda współpraca')
    expect(html).toContain('Holistycznie znaczy czule.')
    expect(html).toContain('Zabiegi')
    expect(html).toContain(
      `<title>${brand.practitionerName} | Kosmetolog | Trycholog | ${primarySalonLocation.address.locality}</title>`,
    )
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('property="og:title"')
    expect(html).toContain(
      `content="${brand.practitionerName} | Kosmetolog i Trycholog w ${primarySalonLocation.localityLocative}"`,
    )
    expect(html).toContain(`content="${brand.siteUrl}"`)
    expect(html).toContain(
      `content="${new URL(brand.logo.imagePath, brand.siteUrl).href}"`,
    )

    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([^<]+)<\/script>/,
    )
    expect(jsonLdMatch).not.toBeNull()
    const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}')
    expect(jsonLd).toEqual(
      toBeautySalonJsonLd({
        brand,
        location: primarySalonLocation,
        priceRange: '30-550 PLN',
      }),
    )
  })

  test('hydrates without browser-global or recoverable errors', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })

    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: brand.practitionerName }),
    ).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => history.state?.__TSR_key))
      .not.toBeFalsy()
    await page.getByRole('button', { name: 'Poznaj mnie' }).click()
    await expect(page).toHaveURL(/#o-mnie$/)

    expect(errors).toEqual([])
  })

  test('uses one fixed reference time for server rendering and hydration', async ({
    page,
    request,
  }) => {
    const referenceUrl = homepageUrlAt(SEPTEMBER_PROMOTION_DATE)
    const response = await request.get(referenceUrl)
    expect(response.ok()).toBe(true)
    expect(await response.text()).toContain(SEPTEMBER_PROMOTION_MESSAGE)

    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })

    await page.goto(referenceUrl)
    await expect
      .poll(() => page.evaluate(() => history.state?.__TSR_key))
      .not.toBeFalsy()
    await expect(
      page.getByRole('status', { name: 'Aktywna promocja' }),
    ).toContainText(SEPTEMBER_PROMOTION_MESSAGE)

    expect(errors).toEqual([])
  })

  test('keeps Router history state during eager and deferred hash navigation', async ({
    page,
  }, testInfo) => {
    await page.goto('/')
    await expect
      .poll(() => page.evaluate(() => history.state?.__TSR_key))
      .not.toBeFalsy()

    await page.getByRole('button', { name: 'Poznaj mnie' }).click()
    await expect(page).toHaveURL(/#o-mnie$/)
    await expect(page.locator('#o-mnie')).toBeInViewport()
    await expect
      .poll(() => page.evaluate(() => history.state?.__TSR_key))
      .not.toBeFalsy()

    if (testInfo.project.name.includes('Mobile')) {
      await page
        .getByRole('navigation', { name: 'Nawigacja dolna' })
        .getByRole('button', { name: 'Kontakt' })
        .click()
    } else {
      await page
        .getByRole('navigation', { name: 'Główna nawigacja' })
        .getByRole('link', { name: 'Kontakt' })
        .click()
    }

    await expect(page).toHaveURL(/#kontakt$/)
    await expect(page.locator('#kontakt')).toBeInViewport({ timeout: 10_000 })
    await expect
      .poll(() => page.evaluate(() => history.state?.__TSR_key))
      .not.toBeFalsy()
  })
})
