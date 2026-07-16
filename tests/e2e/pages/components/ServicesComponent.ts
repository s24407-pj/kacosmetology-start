import { expect, type Locator, type Page } from '@playwright/test'

export class ServicesComponent {
  readonly section: Locator
  readonly heading: Locator
  readonly servicesGrid: Locator

  constructor(public readonly page: Page) {
    this.section = page.locator('#zabiegi')
    this.heading = page.getByRole('heading', { name: 'Zabiegi', level: 2 })
    this.servicesGrid = page.locator('#services-grid')
  }

  async scrollTo() {
    await this.section.scrollIntoViewIfNeeded()
  }

  getViewButton(name: string) {
    return this.page.getByRole('button', { name })
  }

  getServiceCard(name: string) {
    return this.page.getByRole('button', { name })
  }

  async selectCategory(name: string) {
    const viewButton = this.getViewButton(name)
    await this.scrollTo()
    await viewButton.click()
    await expect(viewButton).toHaveAttribute('aria-pressed', 'true')
  }

  async selectPromotions(expectedText: string) {
    await this.selectCategory('Promocje')
    await expect(
      this.servicesGrid.getByRole('heading', { name: 'Aktualna promocja' }),
    ).toBeVisible()
    await expect(
      this.servicesGrid.getByText(expectedText, { exact: true }),
    ).toBeVisible()
  }

  getConsultationNotice() {
    return this.page.getByText(
      'Kolejne zabiegi wymagają wcześniejszej konsultacji.',
      {
        exact: true,
      },
    )
  }
}
