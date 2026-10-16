import { brand } from '@data/business'
import { HOMEPAGE_PRIMARY_IMAGE_PATH } from '@data/home'

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
    alt: 'Katarzyna Suwalska – kosmetolog i trycholog w Ka.Cosmetology w Starogardzie Gdańskim',
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

export const formatRouteTitle = (title: string): string =>
  `${title} | ${brand.name}`

export const homeRouteMetadata = {
  path: '/',
  title: 'Kosmetolog i trycholog w Starogardzie Gdańskim',
  completeTitle: formatRouteTitle(
    'Kosmetolog i trycholog w Starogardzie Gdańskim',
  ),
  description:
    'Indywidualna kosmetologia i trychologia w Ka.Cosmetology. Poznaj specjalizacje i umów wizytę.',
  socialImage: routeSocialImages.home,
  primaryImagePath: HOMEPAGE_PRIMARY_IMAGE_PATH,
} as const

export function createRouteHead({
  path,
  title,
  description,
  socialImage,
  robots,
}: {
  path: string
  title: string
  description: string
  socialImage: SocialImageDescriptor
  robots?: string
}) {
  const canonical = new URL(path, brand.siteUrl).href
  const completeTitle = formatRouteTitle(title)
  const socialImageUrl = new URL(socialImage.path, brand.siteUrl).href
  return {
    meta: [
      { title: completeTitle },
      { name: 'description', content: description },
      ...(robots ? [{ name: 'robots', content: robots }] : []),
      { property: 'og:title', content: completeTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: socialImageUrl },
      { property: 'og:image:alt', content: socialImage.alt },
      { property: 'og:image:type', content: socialImage.type },
      { property: 'og:image:width', content: socialImage.width.toString() },
      { property: 'og:image:height', content: socialImage.height.toString() },
    ],
    links: [{ rel: 'canonical', href: canonical }],
  }
}
