import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { SEPTEMBER_PROMOTION_DATE } from './utils/dates'
import { mockDate } from './utils/mockDate'

test.describe('Promotion banner', () => {
  test.beforeEach(async ({ page }) => {
    await mockDate(page, SEPTEMBER_PROMOTION_DATE)
  })

  test('displays active promotion banner with call to action', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.activePromotionBanner).toBeVisible()
    await expect(homePage.activePromotionBanner).toContainText(
      'Promocja! - wszystkie zabiegi przez cały wrzesień.',
    )

    const cta = page.getByRole('link', {
      name: 'Zarezerwuj termin',
      exact: true,
    })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute(
      'href',
      'https://kacosmetology.booksy.com',
    )
  })

  test('allows dismissing the promotion banner without persisting the state', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.activePromotionBanner).toBeVisible()

    await homePage.dismissPromotionBannerButton.click()

    await expect(homePage.activePromotionBanner).toHaveCount(0)

    const storageValue = await page.evaluate(() =>
      window.localStorage.getItem('ka-promotion-banner-dismissed'),
    )

    expect(storageValue).toBeNull()

    await page.reload()

    await expect(homePage.activePromotionBanner).toBeVisible()
  })
})
