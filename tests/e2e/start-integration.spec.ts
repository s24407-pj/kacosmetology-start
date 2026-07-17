import { contact } from '@data/contact'
import { toSchemaOrgOpeningHoursSpecifications } from '@libs/openingHours'
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
    expect(html).toContain('Katarzyna Suwalska')
    expect(html).toContain('O mnie')
    expect(html).toContain('Jak wygląda współpraca')
    expect(html).toContain('Holistycznie znaczy czule.')
    expect(html).toContain('Zabiegi')
    expect(html).toContain(
      '<title>Katarzyna Suwalska | Kosmetolog | Trycholog | Starogard Gdański</title>',
    )
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('property="og:title"')
    expect(html).toContain('content="https://kacosmetology.pl/"')
    expect(html).toContain(
      'content="https://kacosmetology.pl/images/logo.webp"',
    )

    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([^<]+)<\/script>/,
    )
    expect(jsonLdMatch).not.toBeNull()
    const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}')
    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      '@id': 'https://kacosmetology.pl/#beautysalon',
      name: 'Ka.Cosmetology',
      image: 'https://kacosmetology.pl/images/logo.webp',
      url: 'https://kacosmetology.pl/',
      telephone: '+48 726 154 460',
      email: 'gabinet@kacosmetology.pl',
      priceRange: '30-550 PLN',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ul. Paderewskiego 11a',
        postalCode: '83-200',
        addressLocality: 'Starogard Gdański',
        addressCountry: 'PL',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 53.898941431338294,
        longitude: 18.595858632430925,
      },
      areaServed: { '@type': 'City', name: 'Starogard Gdański' },
      hasMap:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d146965.76001793574!2d18.595858632430925!3d53.898941431338294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47029ddcdf06e639%3A0x22e7786a8b623b1a!2sKa.Cosmetology%20Kosmetolog%20%7C%20Trycholog!5e0!3m2!1spl!2spl!4v1757628479347!5m2!1spl!2spl',
      openingHoursSpecification: toSchemaOrgOpeningHoursSpecifications(
        contact.openingSchedule,
      ),
      sameAs: [
        'https://kacosmetology.booksy.com',
        'https://www.instagram.com/ka.cosmetology',
        'https://www.facebook.com/profile.php?id=61579179969990',
      ],
    })
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
      page.getByRole('heading', { name: 'Katarzyna Suwalska' }),
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
