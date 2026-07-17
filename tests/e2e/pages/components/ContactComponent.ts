import type { Locator, Page } from '@playwright/test'

export class ContactComponent {
  readonly section: Locator
  readonly footer: Locator
  readonly aside: Locator

  readonly phoneLink: Locator
  readonly emailLink: Locator
  readonly address: Locator
  readonly booksyCta: Locator

  constructor(public readonly page: Page) {
    this.section = page.locator('#kontakt')
    this.footer = page.locator('footer')
    this.aside = page.locator('aside')
    this.phoneLink = this.section.locator('a[href^="tel:"]')
    this.emailLink = this.section.locator('a[href^="mailto:"]')
    this.address = this.section.locator('address')
    this.booksyCta = this.section.getByRole('link', {
      name: 'Umów wizytę przez Booksy',
    })
  }

  getAsidePhoneButton() {
    return this.aside.getByRole('link', { name: /Zadzwoń pod numer/ })
  }

  getAsideInstagramLink() {
    return this.aside.getByRole('link', { name: 'Instagram' })
  }

  getAsideFacebookLink() {
    return this.aside.getByRole('link', { name: 'Facebook' })
  }

  getSectionInstagramLink() {
    return this.section.getByRole('link', { name: '@ka.cosmetology' })
  }

  getSectionFacebookLink() {
    return this.section.getByRole('link', {
      name: 'Ka.Cosmetology',
      exact: true,
    })
  }

  getFooterInstagramLink() {
    return this.footer.getByRole('link', { name: 'Instagram' })
  }

  getFooterFacebookLink() {
    return this.footer.getByRole('link', { name: 'Facebook' })
  }

  getTodayHours() {
    return this.section.locator('span[aria-current="date"]')
  }

  async scrollTo() {
    await this.section.scrollIntoViewIfNeeded()
  }
}
