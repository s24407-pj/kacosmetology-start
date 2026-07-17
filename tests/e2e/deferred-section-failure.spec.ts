import { expect, test } from '@playwright/test'

const effectsChunkPattern =
  /^\/assets\/EffectsGallerySection-[^/]+\.js(?:\?.*)?$/

test('escalates a deferred chunk failure to the route boundary', async ({
  page,
}) => {
  let matchedRequests = 0

  await page.route('**/assets/EffectsGallerySection-*.js', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    if (!effectsChunkPattern.test(pathname)) {
      await route.continue()
      return
    }

    matchedRequests += 1
    if (matchedRequests === 1) {
      await route.abort('failed')
      return
    }

    await route.continue()
  })

  await page.goto('/')

  await expect.poll(() => matchedRequests).toBe(1)
  await expect(page.getByRole('heading', { name: 'Katarzyna Suwalska' })).toHaveCount(
    0,
  )
  await expect(page.locator('#galeria')).toHaveCount(0)
  await expect(page.locator('#opinie')).toHaveCount(0)
  await expect(page.locator('#kontakt')).toHaveCount(0)
})
