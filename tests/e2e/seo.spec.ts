import { brand } from '@data/business'
import { type APIRequestContext, expect, test } from '@playwright/test'

async function sitemapPaths(request: APIRequestContext) {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)
  const xml = await response.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  )
}

type JsonLdNode = { '@type': string }

function jsonLdTypes(html: string) {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ]
    .flatMap(([, json]) => JSON.parse(json) as JsonLdNode | JsonLdNode[])
    .map((node) => node['@type'])
}

test.describe('crawler-facing outputs', () => {
  test.skip(({ isMobile }) => isMobile, 'Server output is viewport independent')

  test('robots.txt points crawlers at the sitemap', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain(
      `Sitemap: ${new URL('sitemap.xml', brand.siteUrl).href}`,
    )
  })

  test('every sitemap URL is server-rendered with one H1 and valid JSON-LD', async ({
    request,
  }) => {
    const paths = await sitemapPaths(request)
    expect(paths).toContain('/')

    for (const path of paths) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      const html = await response.text()
      expect(html.match(/<h1[\s>]/g) ?? [], path).toHaveLength(1)

      const types = jsonLdTypes(html)
      if (path === '/') {
        expect(types, path).toContain('BeautySalon')
        expect(types, path).toContain('WebPage')
      }
      if (path.split('/').length === 3) expect(types, path).toContain('Service')
    }
  })

  test('privacy policy stays accessible but is excluded from indexing', async ({
    page,
    request,
  }) => {
    const response = await page.goto('/polityka-prywatnosci')

    expect(response?.status()).toBe(200)

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, follow',
    )

    const paths = await sitemapPaths(request)
    expect(paths).not.toContain('/polityka-prywatnosci')
  })

  test('home page structured data includes BeautySalon and WebPage with canonical metadata', async ({
    page,
  }) => {
    await page.goto('/')
    const title = await page.title()

    const { webPage, beautySalon } = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => {
        let webPageNode: Record<string, unknown> | null = null
        let beautySalonNode: Record<string, unknown> | null = null
        for (const script of scripts) {
          const data = JSON.parse(script.textContent || '{}')
          if (data['@type'] === 'WebPage') webPageNode = data
          if (data['@type'] === 'BeautySalon') beautySalonNode = data
        }
        return { webPage: webPageNode, beautySalon: beautySalonNode }
      })

    expect(webPage).not.toBeNull()
    expect(webPage?.name).toBe(title)
    expect(webPage?.about).toEqual({
      '@id': 'https://kacosmetology.pl/#beautysalon',
    })
    expect(webPage?.primaryImageOfPage).toEqual({
      '@type': 'ImageObject',
      '@id': 'https://kacosmetology.pl/#primaryimage',
      url: 'https://kacosmetology.pl/images/hero.webp',
    })

    expect(beautySalon).not.toBeNull()
    expect(beautySalon?.image).toBe('https://kacosmetology.pl/images/hero.webp')
    expect(beautySalon?.priceRange).toBe('30-550 PLN')
    expect(typeof beautySalon?.description).toBe('string')
    expect(beautySalon?.description).toBeTruthy()
  })
})
