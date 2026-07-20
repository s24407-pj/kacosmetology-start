import { expect, type Page, test } from '@playwright/test'

const ready = async (page: Page, path: string) => {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute(
    'data-react-client-ready',
    'true',
  )
}

const articlePath = '/blog/pielegnacja-anti-aging-po-50'
const articleTitle =
  'Pielęgnacja anti-aging po 50. roku życia: jak zbudować skuteczną rutynę'

test.describe('blog', () => {
  test('SSR /blog lists the published anti-aging article', async ({ page }) => {
    await ready(page, '/blog')
    await expect(page).toHaveTitle(/Blog \| Ka\.Cosmetology/)
    await expect(
      page.getByRole('heading', { name: 'Blog', level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: articleTitle }),
    ).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://kacosmetology.pl/blog',
    )
  })

  test('main navigation reaches /blog', async ({ page, isMobile }) => {
    await ready(page, '/')
    if (isMobile) {
      await page.getByRole('button', { name: 'Otwórz menu' }).click()
      await page
        .locator('#mobile-menu')
        .getByRole('link', { name: 'Blog' })
        .click()
    } else {
      await page
        .getByRole('navigation', { name: 'Główna nawigacja' })
        .getByRole('link', { name: 'Blog' })
        .click()
    }
    await expect(page).toHaveURL(/\/blog/)
    await expect(
      page.getByRole('heading', { name: 'Blog', level: 1 }),
    ).toBeVisible()
  })

  test('opens the article, supports filters and unknown slug 404', async ({
    page,
  }) => {
    await ready(page, '/blog')
    await page.getByRole('link', { name: articleTitle }).click()
    await expect(page).toHaveURL(articlePath)
    await expect(
      page.getByRole('heading', { name: articleTitle, level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Anti-aging po 50. roku życia — od czego zacząć?',
      }),
    ).toBeVisible()
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article',
    )
    await expect(page.locator('meta[property="og:type"]')).toHaveCount(1)

    await page.getByRole('link', { name: 'Pielęgnacja skóry' }).first().click()
    await expect(page).toHaveURL(/category=pielegnacja-skory/)
    await expect(
      page.getByRole('heading', { name: articleTitle }),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Anti-aging' }).first().click()
    await expect(page).toHaveURL(/tag=anti-aging/)

    await ready(page, '/blog/nieistniejacy-wpis')
    await expect(
      page.getByRole('heading', { name: 'Nie znaleziono strony' }),
    ).toBeVisible()
  })

  test('blog index and article have no horizontal overflow and pass axe', async ({
    page,
  }) => {
    for (const path of ['/blog', articlePath]) {
      await ready(page, path)
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      )
      expect(overflow).toBe(false)

      await page.addStyleTag({
        content: `
          *, *::before, *::after { animation: none !important; transition: none !important; }
          .animate-on-scroll { opacity: 1 !important; transform: none !important; }
        `,
      })
      const AxeBuilder = (await import('@axe-core/playwright')).default
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      const serious = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      )
      expect(serious).toEqual([])
    }
  })
})
