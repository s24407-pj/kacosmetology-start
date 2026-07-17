import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

const NAV_LINKS = [
  'Start',
  'O mnie',
  'Zabiegi',
  'Efekty',
  'Galeria',
  'Opinie',
  'Kontakt',
] as const

test.describe('KaCosmetology homepage', () => {
  test('shows the hero call to action', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.heroHeading).toBeVisible()

    await expect(homePage.heroBookingLink).toBeVisible()
    await expect(homePage.heroBookingLink).toHaveAttribute(
      'href',
      /^https:\/\//,
    )
  })

  test('renders the primary navigation links', async ({ page }) => {
    test.skip(
      test.info().project.name.includes('Mobile'),
      'Desktop nav links are hidden on mobile — BottomNav is used instead',
    )

    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.navigation.topNav).toBeVisible()

    await Promise.all(
      NAV_LINKS.map(async (label) => {
        await expect(homePage.navigation.getTopNavLink(label)).toBeVisible()
      }),
    )
  })
})
