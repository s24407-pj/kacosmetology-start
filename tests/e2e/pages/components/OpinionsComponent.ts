import type { Locator, Page } from '@playwright/test'

export class OpinionsComponent {
  readonly section: Locator

  constructor(public readonly page: Page) {
    this.section = page.locator('#opinie')
  }

  async scrollTo() {
    await this.section.scrollIntoViewIfNeeded()
  }

  getHeading() {
    return this.page.getByRole('heading', { name: 'Opinie', level: 2 })
  }
}
