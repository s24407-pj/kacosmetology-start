import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

test.describe('Navigation and scrolling experiences', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('navigates to a section via bottom navigation bar', async ({ page }) => {
    test.skip(
      !test.info().project.name.includes('Mobile'),
      'Mobile-specific behaviour',
    )

    await expect(homePage.navigation.bottomNav).toBeVisible()

    const servicesButton = homePage.navigation.getBottomNavButton('Zabiegi')
    await expect(servicesButton).toBeVisible()
    await servicesButton.click()

    await page.waitForFunction(() => window.location.hash === '#zabiegi')
    await expect(homePage.services.section).toBeInViewport()
  })

  test('reveals scroll controls and contracts CTA after scrolling', async ({
    page,
  }) => {
    test.skip(
      test.info().project.name.includes('Mobile'),
      'Desktop-specific behaviour',
    )

    const navCta = homePage.navigation.getNavCta()
    const ctaLabel = navCta.locator('span').first()
    const ctaLabelWidthBefore = await ctaLabel.evaluate((element) =>
      parseFloat(window.getComputedStyle(element).width),
    )
    expect(ctaLabelWidthBefore).toBeGreaterThan(0)

    await expect(homePage.navigation.scrollWrapper).toHaveAttribute('inert', '')

    await page.evaluate(() => {
      window.scrollTo(0, 800)
    })
    await page.waitForFunction(() => window.scrollY > 300)
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')))

    await expect
      .poll(async () =>
        ctaLabel.evaluate((element) =>
          parseFloat(window.getComputedStyle(element).width),
        ),
      )
      .toBeLessThan(ctaLabelWidthBefore / 2)

    await expect(homePage.navigation.scrollWrapper).not.toHaveAttribute('inert')

    await homePage.navigation.getScrollToTopButton().click()
    await page.waitForFunction(() => window.scrollY < 1)
    await expect(homePage.navigation.scrollWrapper).toHaveAttribute('inert', '')
  })

  test('shows sticky booking CTA after scrolling past hero', async ({
    page,
  }) => {
    await expect(homePage.navigation.stickyCTAWrapper).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    await page.evaluate(() => window.scrollTo(0, 800))
    await page.waitForFunction(() => window.scrollY > 300)
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')))

    await expect(homePage.navigation.stickyCTAWrapper).toHaveAttribute(
      'aria-hidden',
      'false',
    )

    await expect(
      homePage.navigation.stickyCTAWrapper.getByRole('link', {
        name: 'Umów się',
      }),
    ).toBeVisible()
    await expect(
      homePage.navigation.stickyCTAWrapper.getByRole('link', {
        name: 'Umów się',
      }),
    ).toHaveAttribute('href', /^https:\/\//)

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForFunction(() => window.scrollY < 1)

    await expect(homePage.navigation.stickyCTAWrapper).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  test('secondary hero CTA scrolls the page to the About section', async ({
    page,
  }) => {
    await homePage.heroAboutButton.click()

    await page.waitForFunction(() => window.location.hash === '#o-mnie')
    await expect(homePage.getAboutSection()).toBeInViewport()
    await expect(homePage.getAboutHeading()).toBeVisible()
  })

  test('bottom navigation bar is not visible on desktop', async () => {
    test.skip(
      test.info().project.name.includes('Mobile'),
      'Desktop-specific behaviour',
    )
    await expect(homePage.navigation.bottomNav).not.toBeVisible()
  })

  test('opens and closes the hamburger menu on mobile', async () => {
    test.skip(
      !test.info().project.name.includes('Mobile'),
      'Mobile-specific behaviour',
    )

    const hamburger = homePage.navigation.getHamburgerButton()
    await expect(hamburger).toBeVisible()
    await expect(homePage.navigation.getMobileMenuDialog()).not.toBeVisible()

    await hamburger.click()
    await expect(homePage.navigation.getMobileMenuDialog()).toBeVisible()
    await expect(homePage.navigation.getCloseMenuButton()).toBeVisible()

    await homePage.navigation.getCloseMenuButton().click()
    await expect(homePage.navigation.getMobileMenuDialog()).not.toBeVisible()
  })

  test('navigates to a section via the hamburger menu', async ({ page }) => {
    test.skip(
      !test.info().project.name.includes('Mobile'),
      'Mobile-specific behaviour',
    )

    await homePage.navigation.getHamburgerButton().click()

    const dialog = homePage.navigation.getMobileMenuDialog()
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Kontakt' }).click()

    await expect(homePage.navigation.getMobileMenuDialog()).not.toBeVisible()
    await page.waitForFunction(() => window.location.hash === '#kontakt')
    await expect(homePage.contact.section).toBeInViewport({ timeout: 10000 })
  })

  test('navigates to sections via desktop top navigation', async ({ page }) => {
    test.skip(
      test.info().project.name.includes('Mobile'),
      'Desktop-specific behaviour',
    )

    await homePage.navigation.getTopNavLink('Zabiegi').click()
    await page.waitForFunction(() => window.location.hash === '#zabiegi')
    await expect(homePage.services.section).toBeInViewport()

    await homePage.navigation.getTopNavLink('Kontakt').click()
    await page.waitForFunction(() => window.location.hash === '#kontakt')
    await expect(homePage.contact.section).toBeInViewport()
  })
})
