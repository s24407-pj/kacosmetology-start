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
      if (path === '/') expect(types, path).toContain('BeautySalon')
      if (path.split('/').length === 3) expect(types, path).toContain('Service')
    }
  })
})
