import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

test.describe('Gallery and opinions sections', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('loads gallery section after scrolling', async () => {
    await homePage.gallery.scrollTo()

    await expect(homePage.gallery.section).toBeVisible()
    await expect(homePage.gallery.getHeading()).toBeVisible()
    await expect(homePage.gallery.getImages().first()).toBeVisible()
  })

  test('loads lazy opinions section after scrolling', async () => {
    await homePage.opinions.scrollTo()

    await expect(homePage.opinions.section).toBeVisible()
    await expect(homePage.opinions.getHeading()).toBeVisible()
    await expect(
      homePage.opinions.section.getByText('Zaufały mi klientki'),
    ).toBeVisible()
  })
})
