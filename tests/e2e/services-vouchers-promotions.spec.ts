import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { OCTOBER_PROMOTION_DATE } from './utils/dates'
import { mockDate } from './utils/mockDate'

test.describe('Services vouchers and promotions', () => {
  test.beforeEach(async ({ page }) => {
    await mockDate(page, OCTOBER_PROMOTION_DATE)
  })

  test('shows voucher-specific content for the Vouchery category', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await homePage.services.getCategoryButton('Vouchery').click()

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
    await homePage.goto()

    await homePage.services.getCategoryButton('Promocje').click()

    const banner = page.getByText(/-20% na oczyszczanie wodorowe/i)
    await expect(banner).toBeVisible()

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
