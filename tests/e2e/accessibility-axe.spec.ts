import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { HomePage } from './pages/HomePage'

async function expectNoSeriousA11yViolations(
  page: import('@playwright/test').Page,
) {
  await page.evaluate(() => {
    if (document.getElementById('axe-stable-ui')) return

    const style = document.createElement('style')
    style.id = 'axe-stable-ui'
    style.textContent = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }

    .animate-on-scroll {
      opacity: 1 !important;
      transform: none !important;
    }
  `
    document.head.append(style)
  })

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(
    results.violations.filter((violation) => violation.impact !== 'minor'),
  ).toEqual([])
}

test.describe('Automated accessibility checks', () => {
  test.setTimeout(60_000)

  test('has no serious axe violations on key homepage states', async ({
    page,
  }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expectNoSeriousA11yViolations(page)

    await homePage.services.scrollTo()
    await homePage.services.getCategoryButton('Trychologia').click()
    await homePage.services
      .getServiceCard('Pierwsza konsultacja trychologiczna')
      .click()
    await expectNoSeriousA11yViolations(page)

    await homePage.effects.section.scrollIntoViewIfNeeded()
    await homePage.effects.nextButton.click()
    await expectNoSeriousA11yViolations(page)

    await homePage.contact.section.scrollIntoViewIfNeeded()
    await expectNoSeriousA11yViolations(page)
  })

  test('has no serious axe violations with the mobile menu open', async ({
    page,
  }) => {
    test.skip(
      !test.info().project.name.includes('Mobile'),
      'Mobile-specific behaviour',
    )

    const homePage = new HomePage(page)
    await homePage.goto()

    await homePage.navigation.getHamburgerButton().click()
    await expect(homePage.navigation.getMobileMenuDialog()).toBeVisible()
    await expectNoSeriousA11yViolations(page)
  })
})
