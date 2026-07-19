import AxeBuilder from '@axe-core/playwright'
import { brand } from '@data/business'
import { getPublicServicePath, services } from '@data/services'
import { expect, type Page, test } from '@playwright/test'

const ready = async (page: Page, path: string) => {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute(
    'data-react-client-ready',
    'true',
  )
}

const metadataRoutes = [
  {
    path: '/',
    title: 'Kosmetolog i trycholog w Starogardzie Gdańskim | Ka.Cosmetology',
    description:
      'Indywidualna kosmetologia i trychologia w Ka.Cosmetology. Poznaj specjalizacje i umów wizytę.',
  },
  {
    path: '/galeria',
    title: 'Galeria | Ka.Cosmetology',
    description:
      'Efekty zabiegów i wnętrze gabinetu Ka.Cosmetology w Starogardzie Gdańskim.',
  },
  {
    path: '/kosmetologia',
    title: 'Kosmetologia | Ka.Cosmetology',
    description:
      'Indywidualne terapie skóry i zabiegi kosmetologiczne w Starogardzie Gdańskim.',
  },
  {
    path: '/oprawa-oka',
    title: 'Oprawa oka | Ka.Cosmetology',
    description:
      'Stylizacja brwi i rzęs dopasowana do urody i oczekiwanego efektu w Starogardzie Gdańskim.',
  },
  {
    path: '/trychologia',
    title: 'Trychologia | Ka.Cosmetology',
    description:
      'Konsultacje trychologiczne, badanie skóry głowy i indywidualny plan postępowania.',
  },
  ...services.flatMap((service) => {
    const path = getPublicServicePath(service)
    if (!service.isPublished || !path) return []

    return [
      {
        path,
        title: `${service.name} | ${brand.name}`,
        description: service.shortDescription,
      },
    ]
  }),
]

test.describe('desktop public metadata', () => {
  for (const route of metadataRoutes) {
    test(`${route.path} exposes the metadata contract`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, 'Desktop metadata contract')

      const canonical = new URL(route.path, brand.siteUrl).href
      await ready(page, route.path)
      await expect(page).toHaveTitle(route.title)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        canonical,
      )
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        route.description,
      )
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        'content',
        route.title,
      )
      await expect(
        page.locator('meta[property="og:description"]'),
      ).toHaveAttribute('content', route.description)
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        'content',
        canonical,
      )

      await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
      await expect(page.locator('meta[name="author"]')).toHaveAttribute(
        'content',
        brand.name,
      )
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'index, follow',
      )
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
        'content',
        '#722F37',
      )
      await expect(
        page.locator('meta[property="og:site_name"]'),
      ).toHaveAttribute('content', brand.name)
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        'content',
        'website',
      )
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        'pl_PL',
      )
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        new URL(brand.logo.imagePath, brand.siteUrl).href,
      )
      await expect(
        page.locator('meta[property="og:image:alt"]'),
      ).toHaveAttribute('content', brand.logo.imageAlt)
    })
  }
})

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
    const heading = page
      .getByRole('heading', { name: step })
      .filter({ visible: true })
    await expect(heading).toBeVisible()
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
  const hydrogenCleaningCard = page.locator('article').filter({
    has: page.getByRole('heading', {
      level: 3,
      name: 'Oczyszczanie wodorowe',
    }),
  })
  const hydrogenCleaningDetails = hydrogenCleaningCard.getByRole('link', {
    name: 'Poznaj szczegóły',
  })
  await expect(hydrogenCleaningDetails).toHaveAttribute(
    'href',
    '/kosmetologia/oczyszczanie-wodorowe',
  )
  await hydrogenCleaningDetails.click()
  await expect(page).toHaveURL('/kosmetologia/oczyszczanie-wodorowe')
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
  const eyebrowRegulationCard = page.locator('article').filter({
    has: page.getByRole('heading', {
      level: 3,
      name: 'Regulacja brwi',
    }),
  })
  const eyebrowRegulationDetails = eyebrowRegulationCard.getByRole('link', {
    name: 'Poznaj szczegóły',
  })
  await expect(eyebrowRegulationDetails).toHaveAttribute(
    'href',
    '/oprawa-oka/regulacja-brwi',
  )
  await eyebrowRegulationDetails.click()
  await expect(page).toHaveURL('/oprawa-oka/regulacja-brwi')
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

for (const [path, title] of [
  ['/kosmetologia', 'Od potrzeby skóry do przemyślanego planu'],
  ['/trychologia', 'Konsultacja, zanim wybierzesz zabieg'],
  ['/oprawa-oka', 'Zacznij od efektu, nie od nazwy zabiegu'],
] as const) {
  test(`${path} explains its distinct path without horizontal overflow`, async ({
    page,
  }) => {
    await ready(page, path)
    await expect(
      page.getByRole('heading', { level: 2, name: title }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  })
}

test('booking actions lead directly to Booksy and the legacy route redirects', async ({
  page,
  request,
}) => {
  await ready(page, '/')
  const booksy = page.locator('#hero').getByRole('link', {
    name: 'Umów wizytę w Booksy (otwiera nową kartę)',
    exact: true,
  })
  await expect(booksy).toBeVisible()
  await expect(booksy).toHaveAttribute(
    'href',
    'https://kacosmetology.booksy.com',
  )
  await expect(booksy).toHaveAttribute('target', '_blank')
  await expect(page.locator('a[href^="/rezerwacja"]')).toHaveCount(0)

  const response = await request.get('/rezerwacja', { maxRedirects: 0 })
  expect(response.status()).toBeGreaterThanOrEqual(300)
  expect(response.status()).toBeLessThan(400)
  expect(response.headers().location).toBe('https://kacosmetology.booksy.com')
})

test('desktop navigation exposes home sections and keeps its CTA aligned', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop navigation behavior')
  await page.setViewportSize({ width: 1180, height: 720 })
  await ready(page, '/')

  const navigation = page.getByRole('navigation', {
    name: 'Główna nawigacja',
  })
  const cta = navigation.getByRole('link', {
    name: /Umów wizytę w Booksy/,
  })
  const ctaLabel = cta.getByText('Umów się')

  await expect(ctaLabel).toBeVisible()
  expect(
    await ctaLabel.evaluate(
      (label) => label.scrollWidth <= label.clientWidth + 1,
    ),
  ).toBe(true)

  await navigation.getByRole('link', { name: 'Opinie' }).click()
  await expect(page).toHaveURL(/\/#opinie$/)
  await expect(page.locator('#opinie')).toBeVisible()
  await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(1)
  await expect(
    navigation.getByRole('link', { name: 'Opinie' }),
  ).toHaveAttribute('aria-current', 'page')

  await navigation.getByRole('link', { name: 'Kontakt' }).click()
  await expect(page).toHaveURL(/\/#kontakt$/)
  await expect(page.locator('#kontakt')).toBeVisible()
  await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(1)
  await expect(
    navigation.getByRole('link', { name: 'Kontakt' }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(ctaLabel).toBeHidden()

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)

  const centerOffset = await cta.evaluate((link) => {
    const icon = link.querySelector('svg')
    if (!icon) return Number.POSITIVE_INFINITY
    const linkRect = link.getBoundingClientRect()
    const iconRect = icon.getBoundingClientRect()
    return Math.abs(
      iconRect.left + iconRect.width / 2 - (linkRect.left + linkRect.width / 2),
    )
  })
  expect(centerOffset).toBeLessThanOrEqual(1)
})

test('navigation retries deferred home hash scrolling from another route', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop navigation behavior')
  await page.setViewportSize({ width: 1180, height: 720 })
  await ready(page, '/kosmetologia')

  await page
    .getByRole('navigation', { name: 'Główna nawigacja' })
    .getByRole('link', { name: 'Kontakt' })
    .click()

  await expect(page).toHaveURL(/\/#kontakt$/)
  await expect(page.locator('#kontakt')).toBeInViewport()
})

test('gallery owns effect and cabinet sections', async ({ page }) => {
  await ready(page, '/galeria#efekty')
  await expect(page.locator('#efekty')).toBeVisible()
  await expect(page.locator('#gabinet')).toBeVisible()
})

const revealRoutes = [
  { path: '/kosmetologia', heading: 'Kosmetologia' },
  {
    path: '/kosmetologia/oczyszczanie-wodorowe',
    heading: 'Oczyszczanie wodorowe',
  },
  { path: '/galeria', heading: 'Galeria' },
] as const

test('home keeps LCP hero visible without reveal gating', async ({ page }) => {
  await ready(page, '/')

  const hero = page.locator('#hero')
  const heading = hero.getByRole('heading', {
    level: 1,
    name: 'Katarzyna Suwalska',
  })
  const image = hero.getByRole('img', { name: 'Katarzyna Suwalska' })

  await expect(heading).toBeVisible()
  await expect(image).toBeVisible()
  await expect(
    heading.locator('xpath=ancestor::*[@data-reveal-on-scroll]'),
  ).toHaveCount(0)
  await expect(
    image.locator('xpath=ancestor::*[@data-reveal-on-scroll]'),
  ).toHaveCount(0)

  const aboutReveal = page.locator('#o-mnie [data-reveal-on-scroll]').first()
  await aboutReveal.scrollIntoViewIfNeeded()
  await expect(aboutReveal).toHaveClass(/is-revealed/)
  await expect(aboutReveal).not.toHaveCSS('transition-duration', '0s')
})

for (const route of revealRoutes) {
  test(`${route.path} uses CSS-first reveals`, async ({ page }) => {
    await ready(page, route.path)
    const section = page.locator('section').filter({
      has: page.getByRole('heading', {
        level: 1,
        name: route.heading,
      }),
    })
    const reveal = section.locator('[data-reveal-on-scroll]').filter({
      has: page.getByRole('heading', { level: 1, name: route.heading }),
    })
    await expect(reveal).toHaveCount(1)
    await reveal.scrollIntoViewIfNeeded()
    await expect(reveal).toHaveClass(/is-revealed/)
    await expect(reveal).not.toHaveCSS('transition-duration', '0s')
  })
}

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('removes decorative motion while keeping home content available', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await ready(page, '/')

    await expect(page.locator('.animate-scroll-cue')).toHaveCSS(
      'animation-name',
      'none',
    )

    const reveals = page.locator('[data-reveal-on-scroll]')
    await expect(reveals).not.toHaveCount(0)
    await expect
      .poll(async () =>
        reveals.evaluateAll((elements) =>
          elements.every(
            (element) =>
              !element.classList.contains('reveal-pending') &&
              getComputedStyle(element).opacity === '1',
          ),
        ),
      )
      .toBe(true)

    await ready(page, '/galeria')
    const galleryImages = page.locator('#gabinet img')
    await expect(galleryImages).not.toHaveCount(0)
    await expect
      .poll(async () =>
        galleryImages.evaluateAll((images) =>
          images.every(
            (image) => getComputedStyle(image).transitionDuration === '0s',
          ),
        ),
      )
      .toBe(true)
  })
})

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
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
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
  })
}

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
