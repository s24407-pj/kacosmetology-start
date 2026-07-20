import { brand } from '@data/business'

export type RouteHeadImage = {
  url: string
  alt: string
}

export type CreateRouteHeadInput = {
  path: string
  title: string
  description: string
  /** Defaults to website. Use article for blog posts. */
  ogType?: 'website' | 'article'
  image?: RouteHeadImage
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: readonly string[]
}

/**
 * Builds document head tags for a route.
 * Emits og:type and og:image here (not in the root route) so article pages can
 * override without duplicate conflicting Open Graph tags.
 */
export function createRouteHead({
  path,
  title,
  description,
  ogType = 'website',
  image,
  publishedTime,
  modifiedTime,
  section,
  tags,
}: CreateRouteHeadInput) {
  const canonical = new URL(path, brand.siteUrl).href
  const fullTitle = `${title} | ${brand.name}`
  const ogImage = image ?? {
    url: new URL(brand.logo.imagePath, brand.siteUrl).href,
    alt: brand.logo.imageAlt,
  }

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:type', content: ogType },
      { property: 'og:image', content: ogImage.url },
      { property: 'og:image:alt', content: ogImage.alt },
      ...(publishedTime
        ? [{ property: 'article:published_time', content: publishedTime }]
        : []),
      ...(modifiedTime
        ? [{ property: 'article:modified_time', content: modifiedTime }]
        : []),
      ...(section ? [{ property: 'article:section', content: section }] : []),
      ...(tags?.map((tag) => ({ property: 'article:tag', content: tag })) ??
        []),
    ],
    links: [{ rel: 'canonical', href: canonical }],
  }
}
