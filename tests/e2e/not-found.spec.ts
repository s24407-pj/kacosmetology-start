import { expect, test } from '@playwright/test'

test('404 page ends with the footer', async ({ page, isMobile }) => {
  if (!isMobile) {
    await page.setViewportSize({ width: 1280, height: 1400 })
  }

  await page.goto('/nieistniejacy-adres')
  await expect(page.locator('html')).toHaveAttribute(
    'data-react-client-ready',
    'true',
  )
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Wróć na stronę główną' }),
  ).toHaveAttribute('href', '/')

  await page.locator('footer').scrollIntoViewIfNeeded()

  expect(
    await page.locator('footer').evaluate((footer) => {
      const pageHero = document.querySelector('main > section')

      if (!pageHero) return false

      const footerTop = footer.getBoundingClientRect().top + window.scrollY
      const pageHeroBottom =
        pageHero.getBoundingClientRect().bottom + window.scrollY

      return Math.abs(footerTop - pageHeroBottom) < 1
    }),
  ).toBe(true)

  expect(
    await page.locator('footer').evaluate((footer) => {
      const footerBottom =
        footer.getBoundingClientRect().bottom + window.scrollY

      return Math.abs(document.documentElement.scrollHeight - footerBottom) < 1
    }),
  ).toBe(true)
})
