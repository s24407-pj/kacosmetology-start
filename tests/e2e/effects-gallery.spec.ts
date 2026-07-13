import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

const TOTAL_EFFECTS = 7

test.describe('Effects Gallery Section', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
    await homePage.effects.scrollTo()
  })

  test('displays the effects gallery with first slide', async () => {
    await expect(homePage.effects.section).toBeVisible()
    await expect(homePage.effects.getHeading()).toBeVisible()

    const image = homePage.effects.getImageByAlt(
      'Efekt zabiegu kosmetologicznego numer 1',
    )
    await expect(image).toBeVisible()
    await expect(
      homePage.effects.getEffectDescription('Działanie przeciwstarzeniowe'),
    ).toBeVisible()
    await expect(
      homePage.effects.getCounterText(1, TOTAL_EFFECTS),
    ).toBeVisible()
  })

  test('navigates through carousel with next and previous buttons', async () => {
    await homePage.effects.nextButton.click()
    await expect(
      homePage.effects.getCounterText(2, TOTAL_EFFECTS),
    ).toBeVisible()
    await expect(
      homePage.effects.getEffectDescription('Terapia trądziku'),
    ).toBeVisible()

    await homePage.effects.nextButton.click()
    await expect(
      homePage.effects.getCounterText(3, TOTAL_EFFECTS),
    ).toBeVisible()

    await homePage.effects.prevButton.click()
    await expect(
      homePage.effects.getCounterText(2, TOTAL_EFFECTS),
    ).toBeVisible()
  })

  test('wraps around at carousel boundaries', async () => {
    await homePage.effects.prevButton.click()
    await expect(
      homePage.effects.getCounterText(TOTAL_EFFECTS, TOTAL_EFFECTS),
    ).toBeVisible()
    await expect(
      homePage.effects.getEffectDescription('Indywidualna opieka'),
    ).toBeVisible()

    await homePage.effects.nextButton.click()
    await expect(
      homePage.effects.getCounterText(1, TOTAL_EFFECTS),
    ).toBeVisible()
    await expect(
      homePage.effects.getEffectDescription('Działanie przeciwstarzeniowe'),
    ).toBeVisible()
  })

  test('navigates with dot indicators and highlights current dot', async () => {
    const firstDot = homePage.effects.getDotIndicator(1)
    const thirdDot = homePage.effects.getDotIndicator(3)

    await expect(firstDot).toHaveAttribute('aria-current', 'true')

    await thirdDot.click()
    await expect(
      homePage.effects.getCounterText(3, TOTAL_EFFECTS),
    ).toBeVisible()
    await expect(
      homePage.effects.getEffectDescription('Redukcja rumienia'),
    ).toBeVisible()
    await expect(thirdDot).toHaveAttribute('aria-current', 'true')
    await expect(firstDot).not.toHaveAttribute('aria-current', 'true')
  })

  test('carousel is responsive and visible on different viewport sizes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await homePage.effects.scrollTo()
    await expect(homePage.effects.section).toBeVisible()

    await page.setViewportSize({ width: 768, height: 1024 })
    await homePage.effects.scrollTo()
    await expect(homePage.effects.section).toBeVisible()

    await page.setViewportSize({ width: 1920, height: 1080 })
    await homePage.effects.scrollTo()
    await expect(homePage.effects.section).toBeVisible()
  })
})
