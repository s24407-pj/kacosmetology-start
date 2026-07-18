import { brand } from '@data/business'

export function createRouteHead({
  path,
  title,
  description,
}: {
  path: string
  title: string
  description: string
}) {
  const canonical = new URL(path, brand.siteUrl).href
  return {
    meta: [
      { title: `${title} | ${brand.name}` },
      { name: 'description', content: description },
      { property: 'og:title', content: `${title} | ${brand.name}` },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
    ],
    links: [{ rel: 'canonical', href: canonical }],
  }
}
