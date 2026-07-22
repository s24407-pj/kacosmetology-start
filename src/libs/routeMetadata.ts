import { brand } from '@data/business'

export interface SocialImageDescriptor {
  path: `/images/social/${string}.webp`
  alt: string
  type: 'image/webp'
  width: 1200
  height: 630
}

export const routeSocialImages = {
  home: {
    path: '/images/social/home.webp',
    alt: 'Witryna salonu Ka.Cosmetology w Starogardzie Gdańskim',
    type: 'image/webp',
    width: 1200,
    height: 630,
  },
  gallery: {
    path: '/images/social/gallery.webp',
    alt: 'Wnętrze gabinetu zabiegowego Ka.Cosmetology',
    type: 'image/webp',
    width: 1200,
    height: 630,
  },
  cosmetology: {
    path: '/images/social/cosmetology.webp',
    alt: 'Zabieg kosmetologiczny w Ka.Cosmetology',
    type: 'image/webp',
    width: 1200,
    height: 630,
  },
  eyeStyling: {
    path: '/images/social/eye-styling.webp',
    alt: 'Naturalna stylizacja brwi i rzęs w Ka.Cosmetology',
    type: 'image/webp',
    width: 1200,
    height: 630,
  },
  trichology: {
    path: '/images/social/trichology.webp',
    alt: 'Zabieg trychologiczny skóry głowy w Ka.Cosmetology',
    type: 'image/webp',
    width: 1200,
    height: 630,
  },
} as const satisfies Record<string, SocialImageDescriptor>

export function createRouteHead({
  path,
  title,
  description,
  socialImage,
}: {
  path: string
  title: string
  description: string
  socialImage: SocialImageDescriptor
}) {
  const canonical = new URL(path, brand.siteUrl).href
  const completeTitle = `${title} | ${brand.name}`
  const socialImageUrl = new URL(socialImage.path, brand.siteUrl).href
  return {
    meta: [
      { title: completeTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: completeTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: socialImageUrl },
      { property: 'og:image:alt', content: socialImage.alt },
      { property: 'og:image:type', content: socialImage.type },
      { property: 'og:image:width', content: socialImage.width.toString() },
      { property: 'og:image:height', content: socialImage.height.toString() },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: completeTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: socialImageUrl },
      { name: 'twitter:image:alt', content: socialImage.alt },
    ],
    links: [{ rel: 'canonical', href: canonical }],
  }
}
