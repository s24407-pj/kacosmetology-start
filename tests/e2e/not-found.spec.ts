import { expect, test } from '@playwright/test'

for (const path of [
  '/nieistniejacy-adres',
  '/kosmetologia/nieistniejaca-usluga',
]) {
  test(`${path} returns 404 with recovery inside the app shell`, async ({
    page,
  }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Wróć na stronę główną' }),
    ).toHaveAttribute('href', '/')
    await expect(page.locator('footer')).toBeVisible()
  })
}
