import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

test.describe('Accessibility landmarks', () => {
  test('exposes primary landmarks and labels', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.navigation.topNav).toBeVisible()
    await expect(homePage.contentInfo).toBeVisible()

    await expect(homePage.heroAboutButton).toBeVisible()
    await expect(homePage.navigation.getNavCta()).toBeVisible()

    await homePage.services.scrollTo()
    await expect(homePage.services.heading).toBeVisible()
    await expect(homePage.services.getViewButton('Kosmetologia')).toBeVisible()
    await expect(homePage.services.getViewButton('Trychologia')).toBeVisible()
  })
})
