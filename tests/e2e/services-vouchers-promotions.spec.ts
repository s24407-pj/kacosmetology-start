import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { OCTOBER_PROMOTION_DATE } from './utils/dates'

const OCTOBER_PROMOTION_MESSAGE =
  'Promocja! - oczyszczanie wodorowe – z 250 zł na 200 zł przez cały październik.'
const OCTOBER_SERVICES_PROMOTION =
  '-20% na oczyszczanie wodorowe – z 250 zł na 200 zł przez cały październik.'

test.describe('Services vouchers and promotions', () => {
  test('shows voucher-specific content for the Vouchery category', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.goto({ referenceTime: OCTOBER_PROMOTION_DATE })

    await homePage.services.selectCategory('Vouchery')

    const voucherCard = page.getByRole('heading', {
      name: 'Vouchery prezentowe',
    })
    await expect(voucherCard).toBeVisible()

    const voucherCta = page.getByRole('link', { name: 'Zapytaj o voucher' })
    await expect(voucherCta).toHaveAttribute('href', '#kontakt')
    await expect(
      homePage.services.servicesGrid.getByText(
        'Vouchery są ważne rok od daty zakupu.',
      ),
    ).toBeVisible()
  })

  test('displays active promotion banner and filtered services', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.gotoWithActivePromotion({
      referenceTime: OCTOBER_PROMOTION_DATE,
      expectedText: OCTOBER_PROMOTION_MESSAGE,
    })

    await homePage.services.selectPromotions(OCTOBER_SERVICES_PROMOTION)

    const discountedServiceCard = homePage.services.getServiceCard(
      'Oczyszczanie wodorowe',
    )
    await expect(discountedServiceCard).toBeVisible()
    await expect(discountedServiceCard.getByText('-20%')).toBeVisible()
    await expect(discountedServiceCard.locator('.line-through')).toHaveText(
      '250 zł',
    )
    await expect(
      discountedServiceCard.getByText('200 zł', { exact: true }),
    ).toBeVisible()
    await expect(
      discountedServiceCard.getByText('Najniższa cena (30 dni): 200 zł'),
    ).toBeVisible()

    // Ensure non-promoted services are hidden when filtering promotions only
    await expect(
      homePage.services.getServiceCard(
        'Pierwsza konsultacja kosmetologiczna z zabiegiem',
      ),
    ).toHaveCount(0)
  })
})
