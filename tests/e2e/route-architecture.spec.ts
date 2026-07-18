import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const ready = async (page: import('@playwright/test').Page, path: string) => {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute(
    'data-react-client-ready',
    'true',
  )
}

test('home is compact and leads to all three specializations', async ({
  page,
}) => {
  await ready(page, '/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Katarzyna Suwalska' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Poznaj ofertę — Kosmetologia' }),
  ).toHaveAttribute('href', '/kosmetologia')
  await expect(
    page.getByRole('link', { name: 'Poznaj ofertę — Oprawa oka' }),
  ).toHaveAttribute('href', '/oprawa-oka')
  await expect(
    page.getByRole('link', { name: 'Poznaj ofertę — Trychologia' }),
  ).toHaveAttribute('href', '/trychologia')
  await expect(page.getByRole('heading', { name: 'Pełna oferta' })).toHaveCount(
    0,
  )
})

test('home preserves the four-step process and lazy Google map', async ({
  page,
  isMobile,
}) => {
  await ready(page, '/')
  await expect(
    page.getByRole('heading', { level: 2, name: 'Jak wygląda współpraca' }),
  ).toBeVisible()
  for (const step of [
    'Szczegółowy wywiad',
    'Dobór zabiegu',
    'Zalecenia',
    'Dalsza praca ze skórą',
  ]) {
    const headings = page.getByRole('heading', { name: step })
    await expect(isMobile ? headings.last() : headings.first()).toBeVisible()
  }
  if (!isMobile) {
    await expect(
      page.getByRole('tablist', { name: 'Jak wygląda współpraca' }),
    ).toBeVisible()
  }
  const map = page.getByTitle(/Lokalizacja gabinetu/)
  await map.scrollIntoViewIfNeeded()
  await expect(map).toBeVisible()
  await expect(map).toHaveAttribute('loading', 'lazy')
})

test('landing and detail routes preserve specialization boundaries', async ({
  page,
}) => {
  await ready(page, '/kosmetologia')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Kosmetologia' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: /zabiegu kosmetologicznego/i }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Poznaj szczegóły' }).first().click()
  await expect(page).toHaveURL(/\/kosmetologia\/[a-z0-9-]+$/)
  await expect(page.getByRole('navigation', { name: 'Okruszki' })).toBeVisible()

  await ready(page, '/oprawa-oka')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Oprawa oka' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: /naturalna oprawa oka/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', {
      name: 'Umów wizytę (otwiera nową kartę)',
      exact: true,
    }),
  ).toHaveAttribute('href', 'https://kacosmetology.booksy.com')
  await page.getByRole('link', { name: 'Poznaj szczegóły' }).first().click()
  await expect(page).toHaveURL(/\/oprawa-oka\/[a-z0-9-]+$/)
  await expect(page.getByRole('navigation', { name: 'Okruszki' })).toBeVisible()

  await ready(page, '/trychologia/oczyszczanie-wodorowe')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
  ).toBeVisible()
  await ready(page, '/trychologia/konsultacja-trychologiczna-online')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
  ).toBeVisible()
})

test('specialization pages explain a distinct path without horizontal overflow', async ({
  page,
}) => {
  for (const [path, title] of [
    ['/kosmetologia', 'Od potrzeby skóry do przemyślanego planu'],
    ['/trychologia', 'Konsultacja, zanim wybierzesz zabieg'],
    ['/oprawa-oka', 'Zacznij od efektu, nie od nazwy zabiegu'],
  ] as const) {
    await ready(page, path)
    await expect(
      page.getByRole('heading', { level: 2, name: title }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }

  const regulation = page.getByRole('link', {
    name: 'Regulacja brwi',
    exact: true,
  })
  await expect(regulation).toHaveAttribute('href', '/oprawa-oka/regulacja-brwi')
  await regulation.click()
  await expect(page).toHaveURL(/\/oprawa-oka\/regulacja-brwi$/)
})

test('booking actions lead directly to Booksy and the legacy route redirects', async ({
  page,
  request,
}) => {
  await ready(page, '/')
  const booksy = page.locator('a[href="https://kacosmetology.booksy.com"]')
  await expect(booksy.first()).toBeVisible()
  await expect(booksy.first()).toHaveAttribute('target', '_blank')
  await expect(page.locator('a[href^="/rezerwacja"]')).toHaveCount(0)

  const response = await request.get('/rezerwacja', { maxRedirects: 0 })
  expect(response.status()).toBeGreaterThanOrEqual(300)
  expect(response.status()).toBeLessThan(400)
  expect(response.headers().location).toBe('https://kacosmetology.booksy.com')
})

test('gallery owns effect and cabinet sections', async ({ page }) => {
  await ready(page, '/galeria#efekty')
  await expect(page.locator('#efekty')).toBeVisible()
  await expect(page.locator('#gabinet')).toBeVisible()
})

test('legacy home hashes redirect to their new canonical destinations', async ({
  page,
}) => {
  await ready(page, '/#efekty')
  await expect(page).toHaveURL(/\/galeria#efekty$/)
  await ready(page, '/#services-vouchery')
  await expect(page).toHaveURL(/\/#voucher$/)
})

test('route classes have no serious accessibility violations', async ({
  page,
}) => {
  for (const path of [
    '/',
    '/kosmetologia',
    '/kosmetologia/oczyszczanie-wodorowe',
    '/oprawa-oka',
    '/oprawa-oka/laminacja-brwi-regulacja-bez-koloryzacji',
    '/trychologia',
    '/trychologia/zabieg-trychologiczny-dobrany-indywidualnie',
    '/galeria',
  ]) {
    await ready(page, path)
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; } .animate-on-scroll { opacity: 1 !important; transform: none !important; }',
    })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(
      results.violations.filter(
        ({ impact }) => impact === 'serious' || impact === 'critical',
      ),
    ).toEqual([])
  }
})

test('mobile menu traps focus, closes with Escape and restores the trigger', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile navigation behavior')
  await ready(page, '/')
  const trigger = page.getByRole('button', { name: 'Otwórz menu' })
  await trigger.click()
  await expect(
    page.locator('#mobile-menu').getByRole('link', { name: 'Start' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})
