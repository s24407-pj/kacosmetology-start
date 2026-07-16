import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { SEPTEMBER_PROMOTION_DATE } from './utils/dates'

const SEPTEMBER_PROMOTION_MESSAGE =
  'Promocja! - wszystkie zabiegi przez cały wrzesień.'

test.describe('Promotion banner', () => {
  test('displays active promotion banner with call to action', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.gotoWithActivePromotion({
      referenceTime: SEPTEMBER_PROMOTION_DATE,
      expectedText: SEPTEMBER_PROMOTION_MESSAGE,
    })

    await expect(homePage.activePromotionBanner).toBeVisible()

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
    await homePage.gotoWithActivePromotion({
      referenceTime: SEPTEMBER_PROMOTION_DATE,
      expectedText: SEPTEMBER_PROMOTION_MESSAGE,
    })

    await homePage.dismissPromotionBannerButton.click()

    await expect(homePage.activePromotionBanner).toHaveCount(0)

    const storageValue = await page.evaluate(() =>
      window.localStorage.getItem('ka-promotion-banner-dismissed'),
    )

    expect(storageValue).toBeNull()

    await page.reload()
    await homePage.waitForActivePromotion(SEPTEMBER_PROMOTION_MESSAGE)
  })
})
