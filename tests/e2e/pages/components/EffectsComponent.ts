import type { Locator, Page } from '@playwright/test'

export class EffectsComponent {
  readonly section: Locator
  readonly nextButton: Locator
  readonly prevButton: Locator

  constructor(public readonly page: Page) {
    this.section = page.locator('#efekty')
    this.nextButton = page.getByLabel('Następny efekt')
    this.prevButton = page.getByLabel('Poprzedni efekt')
  }

  async scrollTo() {
    await this.section.scrollIntoViewIfNeeded()
  }

  getHeading() {
    return this.section.getByRole('heading', { name: 'Efekty zabiegów' })
  }

  getImageByAlt(alt: string) {
    return this.section.getByAltText(alt)
  }

  getEffectDescription(text: string) {
    return this.section.getByText(text, { exact: true })
  }

  getCounterText(current: number, total: number) {
    return this.page.getByText(`${current} / ${total}`) // Global getByText in effect checks
  }

  getDotIndicator(index: number) {
    return this.section.getByLabel(`Przejdź do efektu ${index}`)
  }
}
