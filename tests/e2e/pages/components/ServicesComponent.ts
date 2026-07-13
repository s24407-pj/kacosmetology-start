import type { Locator, Page } from '@playwright/test'

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

  getCategoryButton(name: string) {
    return this.page.getByRole('button', { name })
  }

  getServiceCard(name: string) {
    return this.page.getByRole('button', { name })
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
