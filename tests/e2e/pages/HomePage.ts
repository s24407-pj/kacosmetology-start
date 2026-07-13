import type { Locator, Page } from '@playwright/test'
import { ContactComponent } from './components/ContactComponent'
import { EffectsComponent } from './components/EffectsComponent'
import { GalleryComponent } from './components/GalleryComponent'
import { NavigationComponent } from './components/NavigationComponent'
import { OpinionsComponent } from './components/OpinionsComponent'
import { ServicesComponent } from './components/ServicesComponent'

export class HomePage {
  readonly navigation: NavigationComponent
  readonly contact: ContactComponent
  readonly gallery: GalleryComponent
  readonly opinions: OpinionsComponent
  readonly effects: EffectsComponent
  readonly services: ServicesComponent

  readonly activePromotionBanner: Locator
  readonly dismissPromotionBannerButton: Locator

  readonly heroHeading: Locator
  readonly heroBookingLink: Locator
  readonly heroAboutButton: Locator

  readonly contentInfo: Locator

  constructor(public readonly page: Page) {
    this.navigation = new NavigationComponent(page)
    this.contact = new ContactComponent(page)
    this.gallery = new GalleryComponent(page)
    this.opinions = new OpinionsComponent(page)
    this.effects = new EffectsComponent(page)
    this.services = new ServicesComponent(page)

    this.activePromotionBanner = page.getByRole('status', {
      name: 'Aktywna promocja',
    })
    this.dismissPromotionBannerButton = page.getByRole('button', {
      name: 'Zamknij baner promocji',
    })

    this.heroHeading = page.getByRole('heading', { name: 'Katarzyna Suwalska' })
    this.heroBookingLink = page
      .getByRole('link', { name: 'Umów wizytę', exact: true })
      .first()
    this.heroAboutButton = page.getByRole('button', { name: 'Poznaj mnie' })

    this.contentInfo = page.getByRole('contentinfo')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForFunction(() => Boolean(history.state?.__TSR_key))
    await this.page.locator('#kontakt').waitFor({ state: 'attached' })
  }

  getAboutSection() {
    return this.page.locator('#o-mnie')
  }

  getAboutHeading() {
    return this.page.getByRole('heading', { name: 'O Mnie', level: 2 })
  }
}
