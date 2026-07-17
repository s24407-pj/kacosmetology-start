import { brand, primarySalonLocation } from '@data/business'
import { toBeautySalonJsonLd } from '@libs/businessMetadata'
import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { OPEN_WEEKDAY_DATE } from './utils/dates'

test.describe('Contact section', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('keeps canonical business data in parity across public surfaces', async ({
    request,
  }) => {
    const normalizedPhone = primarySalonLocation.phone.replace(/\s+/g, '')
    await expect(homePage.contact.phoneLink).toHaveAttribute(
      'href',
      `tel:${normalizedPhone}`,
    )
    await expect(homePage.contact.emailLink).toHaveAttribute(
      'href',
      `mailto:${brand.email}`,
    )
    await expect(homePage.contact.address).toContainText(
      primarySalonLocation.address.streetAddress,
    )
    await expect(homePage.contact.address).toContainText(
      `${primarySalonLocation.address.postalCode} ${primarySalonLocation.address.locality}`,
    )

    await expect(
      homePage.contact.footer.getByText(primarySalonLocation.phone),
    ).toBeVisible()
    await expect(homePage.contact.footer.getByText(brand.email)).toBeVisible()
    await expect(homePage.contact.getAsideInstagramLink()).toHaveAttribute(
      'href',
      brand.socialMedia.instagram,
    )
    await expect(homePage.contact.getAsideFacebookLink()).toHaveAttribute(
      'href',
      brand.socialMedia.facebook,
    )

    const map = homePage.page.getByTitle(
      `Lokalizacja gabinetu ${brand.name} w ${primarySalonLocation.address.locality}`,
    )
    await expect(map).toHaveAttribute('src', primarySalonLocation.map.embedUrl)

    for (const bookingLink of [
      homePage.heroBookingLink,
      homePage.contact.booksyCta,
      homePage.contact.footer.getByRole('link', { name: 'Umów się' }),
    ]) {
      await expect(bookingLink).toHaveAttribute(
        'href',
        primarySalonLocation.bookingUrl,
      )
    }

    const response = await request.get('/')
    expect(response.ok()).toBe(true)
    const html = await response.text()
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([^<]+)<\/script>/,
    )
    expect(jsonLdMatch).not.toBeNull()
    expect(JSON.parse(jsonLdMatch?.[1] ?? '{}')).toEqual(
      toBeautySalonJsonLd({
        brand,
        location: primarySalonLocation,
        priceRange: '30-550 PLN',
      }),
    )
  })

  test.describe('aside column', () => {
    test('shows social and phone links in viewport', async () => {
      const phoneLink = homePage.contact.getAsidePhoneButton()
      await expect(phoneLink).toBeVisible()
      await expect(phoneLink).toBeInViewport()
      await expect(phoneLink).toHaveAttribute('href', /^tel:/)
    })

    test('exposes social media links with correct attributes', async () => {
      const instagramLink = homePage.contact.getAsideInstagramLink()
      await expect(instagramLink).toBeVisible()
      await expect(instagramLink).toHaveAttribute('href', /^https:\/\//)
      await expect(instagramLink).toHaveAttribute('target', '_blank')
      await expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')

      const facebookLink = homePage.contact.getAsideFacebookLink()
      await expect(facebookLink).toBeVisible()
      await expect(facebookLink).toHaveAttribute('href', /^https:\/\//)
      await expect(facebookLink).toHaveAttribute('target', '_blank')
      await expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    test('positions social links above the phone button', async () => {
      const instagramLink = homePage.contact.getAsideInstagramLink()
      const facebookLink = homePage.contact.getAsideFacebookLink()
      const phoneButton = homePage.contact.getAsidePhoneButton()

      const instagramBox = await instagramLink.boundingBox()
      const facebookBox = await facebookLink.boundingBox()
      const phoneBox = await phoneButton.boundingBox()

      if (instagramBox && phoneBox) {
        expect(instagramBox.y).toBeLessThan(phoneBox.y)
      }
      if (facebookBox && phoneBox) {
        expect(facebookBox.y).toBeLessThan(phoneBox.y)
      }
    })
  })

  test.describe('footer', () => {
    test('shows social links and contact information', async () => {
      await expect(homePage.contact.getFooterInstagramLink()).toBeVisible()
      await expect(homePage.contact.getFooterFacebookLink()).toBeVisible()

      await expect(
        homePage.contact.footer.locator('a[href^="tel:"]'),
      ).toBeVisible()
      await expect(
        homePage.contact.footer.locator('a[href^="mailto:"]'),
      ).toBeVisible()
      await expect(homePage.contact.footer.getByText(/ul\./)).toBeVisible()
    })
  })

  test.describe('contact section', () => {
    test('shows social links and address details', async () => {
      await homePage.contact.scrollTo()

      await expect(homePage.contact.getSectionInstagramLink()).toBeVisible()
      await expect(homePage.contact.getSectionFacebookLink()).toBeVisible()
      await expect(homePage.contact.phoneLink).toBeVisible()
      await expect(homePage.contact.emailLink).toBeVisible()
      await expect(homePage.contact.address).toBeVisible()
    })
  })

  test.describe('opening hours and CTAs', () => {
    test('highlights opening hours and exposes correct CTAs', async ({
      page,
    }) => {
      test.skip(
        test.info().project.name.includes('Mobile'),
        'Run on desktop form factors to inspect sticky actions comfortably',
      )

      const contactHomePage = new HomePage(page)
      await contactHomePage.goto({ referenceTime: OPEN_WEEKDAY_DATE })

      const stickyPhoneButton = contactHomePage.contact.getAsidePhoneButton()
      await expect(stickyPhoneButton).toBeVisible()
      await expect(stickyPhoneButton).toHaveAttribute('href', /^tel:/)
      await expect(stickyPhoneButton).toHaveAccessibleName(
        /gabinet jest teraz otwarty/,
      )

      await contactHomePage.contact.scrollTo()

      const todayHours = contactHomePage.contact.getTodayHours()
      await expect(todayHours).toContainText('09:00 - 17:00')
      await expect(todayHours).toContainText('gabinet jest teraz otwarty')

      await expect(contactHomePage.contact.phoneLink).toHaveAttribute(
        'href',
        /^tel:/,
      )
      await expect(contactHomePage.contact.emailLink).toHaveAttribute(
        'href',
        /^mailto:/,
      )

      const instagramLink = contactHomePage.contact.getSectionInstagramLink()
      await expect(instagramLink).toHaveAttribute('href', /^https:\/\//)
      await expect(instagramLink).toHaveAttribute('target', '_blank')

      const booksyCta = contactHomePage.contact.booksyCta
      await expect(booksyCta).toHaveAttribute('href', /^https:\/\//)
      await expect(booksyCta).toHaveAttribute('target', '_blank')
    })

    test('shows the closed state on Sunday without an open phone suffix', async ({
      page,
    }) => {
      test.skip(
        test.info().project.name.includes('Mobile'),
        'Run on desktop form factors to inspect sticky actions comfortably',
      )

      const contactHomePage = new HomePage(page)
      await contactHomePage.goto({
        referenceTime: '2024-03-10T12:00:00+01:00',
      })

      const stickyPhoneButton = contactHomePage.contact.getAsidePhoneButton()
      await expect(stickyPhoneButton).toBeVisible()
      await expect(stickyPhoneButton).toHaveAccessibleName(/Zadzwoń pod numer/)
      await expect(stickyPhoneButton).not.toHaveAccessibleName(
        /gabinet jest teraz otwarty/,
      )

      await contactHomePage.contact.scrollTo()
      await expect(
        contactHomePage.contact.section.getByText('Obecnie zamknięte'),
      ).toBeVisible()
      await expect(contactHomePage.contact.getTodayHours()).toContainText(
        'Zamknięte',
      )
    })
  })
})
