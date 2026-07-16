import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { OPEN_WEEKDAY_DATE } from './utils/dates'

test.describe('Contact section', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
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
      await expect(instagramLink).toHaveAttribute(
        'href',
        'https://www.instagram.com/ka.cosmetology',
      )
      await expect(instagramLink).toHaveAttribute('target', '_blank')
      await expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')

      const facebookLink = homePage.contact.getAsideFacebookLink()
      await expect(facebookLink).toBeVisible()
      await expect(facebookLink).toHaveAttribute(
        'href',
        'https://www.facebook.com/profile.php?id=61579179969990',
      )
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
        homePage.contact.footer.getByText('+48 726 154 460'),
      ).toBeVisible()
      await expect(
        homePage.contact.footer.getByText('gabinet@kacosmetology.pl'),
      ).toBeVisible()
      await expect(
        homePage.contact.footer.getByText(/ul\. Paderewskiego 11a/),
      ).toBeVisible()
    })
  })

  test.describe('contact section', () => {
    test('shows social links and address details', async () => {
      await homePage.contact.scrollTo()

      await expect(homePage.contact.getSectionInstagramLink()).toBeVisible()
      await expect(homePage.contact.getSectionFacebookLink()).toBeVisible()
      await expect(homePage.contact.phoneLink).toBeVisible()
      await expect(homePage.contact.emailLink).toBeVisible()
      await expect(
        homePage.contact.section.getByText(/ul\. Paderewskiego 11a/),
      ).toBeVisible()
      await expect(
        homePage.contact.section.getByText(/83-200 Starogard Gdański/),
      ).toBeVisible()
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
      await expect(stickyPhoneButton).toHaveAttribute(
        'href',
        'tel:+48726154460',
      )
      await expect(stickyPhoneButton).toHaveAccessibleName(
        /gabinet jest teraz otwarty/,
      )

      await contactHomePage.contact.scrollTo()

      const todayHours = contactHomePage.contact.getTodayHours()
      await expect(todayHours).toContainText('09:00 - 17:00')
      await expect(todayHours).toContainText('gabinet jest teraz otwarty')

      await expect(contactHomePage.contact.phoneLink).toHaveAttribute(
        'href',
        'tel:+48726154460',
      )
      await expect(contactHomePage.contact.emailLink).toHaveAttribute(
        'href',
        'mailto:gabinet@kacosmetology.pl',
      )

      const instagramLink = contactHomePage.contact.getSectionInstagramLink()
      await expect(instagramLink).toHaveAttribute(
        'href',
        'https://www.instagram.com/ka.cosmetology',
      )
      await expect(instagramLink).toHaveAttribute('target', '_blank')

      const booksyCta = contactHomePage.contact.booksyCta
      await expect(booksyCta).toHaveAttribute(
        'href',
        'https://kacosmetology.booksy.com',
      )
      await expect(booksyCta).toHaveAttribute('target', '_blank')
    })
  })
})
