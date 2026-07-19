import { expect, test } from '@playwright/test'

test('404 page provides recovery within the app shell', async ({ page }) => {
  await page.goto('/nieistniejacy-adres')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Wróć na stronę główną' }),
  ).toHaveAttribute('href', '/')
  await expect(page.locator('footer')).toBeVisible()
})
