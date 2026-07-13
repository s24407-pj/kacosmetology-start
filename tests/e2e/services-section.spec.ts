import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

test.describe('Services catalogue interactions', () => {
  test('filters categories, shows consultation notice and expands details', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.services.scrollTo()

    await homePage.services.getCategoryButton('Trychologia').click()

    await expect(homePage.services.getConsultationNotice()).toBeVisible()

    const consultationCard = homePage.services.getServiceCard(
      'Zabieg trychologiczny dobrany indywidualnie',
    )
    await consultationCard.focus()
    await consultationCard.press('Enter')

    await expect(consultationCard).toHaveAttribute('aria-expanded', 'true')
    await expect(
      homePage.services.section.getByText('Opis zabiegu'),
    ).toBeVisible()

    const firstServiceCard = homePage.services.getServiceCard(
      'Pierwsza konsultacja trychologiczna',
    )
    await firstServiceCard.click()
    await expect(firstServiceCard).toHaveAttribute('aria-expanded', 'true')
    await expect(
      homePage.services.section.getByText('Przygotowanie do wizyty'),
    ).toBeVisible()
  })
})
