import { expect, type Locator, type Page } from '@playwright/test'
import { homepageUrlAt } from '../utils/referenceTime'
import { ContactComponent } from './components/ContactComponent'
import { EffectsComponent } from './components/EffectsComponent'
import { GalleryComponent } from './components/GalleryComponent'
import { NavigationComponent } from './components/NavigationComponent'
import { OpinionsComponent } from './components/OpinionsComponent'
import { ServicesComponent } from './components/ServicesComponent'

interface HomePageNavigationOptions {
  referenceTime?: string
}

interface ActivePromotionNavigationOptions extends HomePageNavigationOptions {
  expectedText: string
}

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
  readonly mapFrame: Locator

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
    this.mapFrame = page.getByTitle(
      'Lokalizacja gabinetu Ka.Cosmetology w Starogardzie Gdańskim',
    )
  }

  async goto({ referenceTime }: HomePageNavigationOptions = {}) {
    await this.page.goto(
      referenceTime === undefined ? '/' : homepageUrlAt(referenceTime),
    )
    await this.waitUntilReady()
  }

  async gotoWithActivePromotion({
    referenceTime,
    expectedText,
  }: ActivePromotionNavigationOptions) {
    await this.goto({ referenceTime })
    await this.waitForActivePromotion(expectedText)
  }

  async waitUntilReady() {
    await expect(this.page.locator('html')).toHaveAttribute(
      'data-react-client-ready',
      'true',
    )
    await this.page.waitForFunction(() => Boolean(history.state?.__TSR_key))
    await expect(this.heroHeading).toBeVisible()
  }

  async waitForActivePromotion(expectedText: string) {
    await this.waitUntilReady()
    await expect(this.activePromotionBanner).toBeVisible()
    await expect(this.activePromotionBanner).toContainText(expectedText)
  }

  getAboutSection() {
    return this.page.locator('#o-mnie')
  }

  getAboutHeading() {
    return this.page.getByRole('heading', { name: 'O Mnie', level: 2 })
  }

  getDeferredSectionFailureAlert(sectionLabel: string) {
    return this.page
      .getByRole('alert')
      .filter({ hasText: `Nie udało się wczytać sekcji „${sectionLabel}”.` })
  }

  getDeferredSectionReloadButton(sectionLabel: string) {
    return this.getDeferredSectionFailureAlert(sectionLabel).getByRole(
      'button',
      { name: 'Odśwież stronę' },
    )
  }
}
