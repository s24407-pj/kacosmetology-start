import type { Locator, Page } from '@playwright/test'

export class ContactComponent {
  readonly section: Locator
  readonly footer: Locator
  readonly aside: Locator

  readonly phoneLink: Locator
  readonly emailLink: Locator
  readonly addressRegex: RegExp
  readonly booksyCta: Locator

  constructor(public readonly page: Page) {
    this.section = page.locator('#kontakt')
    this.footer = page.locator('footer')
    this.aside = page.locator('aside')
    this.phoneLink = this.section.getByRole('link', { name: '+48 726 154 460' })
    this.emailLink = this.section.getByRole('link', {
      name: 'gabinet@kacosmetology.pl',
    })
    this.addressRegex = /ul\. Paderewskiego 11a/
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
    return this.section.locator('a[href*="facebook.com"]')
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
