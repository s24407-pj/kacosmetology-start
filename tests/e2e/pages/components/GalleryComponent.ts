import type { Locator, Page } from '@playwright/test'

export class GalleryComponent {
  readonly section: Locator

  constructor(public readonly page: Page) {
    this.section = page.locator('#galeria')
  }

  async scrollTo() {
    await this.section.scrollIntoViewIfNeeded()
  }

  getHeading() {
    return this.page.getByRole('heading', { name: 'Galeria', level: 2 })
  }

  getImages() {
    return this.section.getByRole('img')
  }
}
