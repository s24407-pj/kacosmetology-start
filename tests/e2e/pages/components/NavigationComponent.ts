import type { Locator, Page } from '@playwright/test'

export class NavigationComponent {
  readonly topNav: Locator
  readonly bottomNav: Locator
  readonly stickyCTAWrapper: Locator
  readonly scrollWrapper: Locator

  constructor(public readonly page: Page) {
    this.topNav = page.getByRole('navigation', { name: 'Główna nawigacja' })
    this.bottomNav = page.getByRole('navigation', { name: 'Nawigacja dolna' })

    // Sticky aside wrapper (different from nav CTA)
    this.stickyCTAWrapper = page.locator('div[aria-hidden]').filter({
      has: page.locator('a').filter({ hasText: /^Umów się$/ }),
    })

    this.scrollWrapper = page.locator('aside > div').filter({
      has: page.getByRole('button', { name: 'Przewiń na górę' }),
    })
  }

  getTopNavLink(name: string) {
    return this.topNav.getByRole('link', { name })
  }

  getBottomNavButton(name: string) {
    return this.bottomNav.getByRole('button', { name })
  }

  getHamburgerButton() {
    return this.page.getByRole('button', { name: 'Otwórz menu' })
  }

  getMobileMenuDialog() {
    return this.page.getByRole('dialog', { name: 'Menu nawigacyjne' })
  }

  getCloseMenuButton() {
    return this.page.getByRole('button', { name: 'Zamknij menu' })
  }

  getScrollToTopButton() {
    return this.page.getByRole('button', { name: 'Przewiń na górę' })
  }

  getNavCta() {
    return this.page.locator('nav').getByRole('link', { name: 'Umów się' })
  }
}
