import { brand } from '@data/business'
import { describe, expect, it } from 'vitest'
import {
  createRouteHead,
  formatRouteTitle,
  HOMEPAGE_PRIMARY_IMAGE_PATH,
  homeRouteMetadata,
  routeSocialImages,
} from './routeMetadata'

describe('createRouteHead', () => {
  it('resolves route paths against the canonical site URL', () => {
    const head = createRouteHead({
      path: '/kosmetologia/oczyszczanie-wodorowe',
      title: 'Oczyszczanie wodorowe',
      description: 'Opis usługi.',
      socialImage: routeSocialImages.cosmetology,
    })

    expect(head.links).toEqual([
      {
        rel: 'canonical',
        href: 'https://kacosmetology.pl/kosmetologia/oczyszczanie-wodorowe',
      },
    ])
  })

  it('returns the complete route title, description and Open Graph metadata', () => {
    const description = 'Efekty zabiegów i wnętrze gabinetu.'
    const head = createRouteHead({
      path: '/galeria',
      title: 'Galeria',
      description,
      socialImage: routeSocialImages.gallery,
    })

    expect(head.meta).toEqual([
      { title: `Galeria | ${brand.name}` },
      { name: 'description', content: description },
      { property: 'og:title', content: `Galeria | ${brand.name}` },
      { property: 'og:description', content: description },
      {
        property: 'og:url',
        content: 'https://kacosmetology.pl/galeria',
      },
      {
        property: 'og:image',
        content: 'https://kacosmetology.pl/images/social/gallery.webp',
      },
      {
        property: 'og:image:alt',
        content: routeSocialImages.gallery.alt,
      },
      { property: 'og:image:type', content: 'image/webp' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
    ])
  })

  it('includes a robots meta tag when requested', () => {
    const head = createRouteHead({
      path: '/polityka-prywatnosci',
      title: 'Polityka prywatności',
      description: 'Opis.',
      socialImage: routeSocialImages.home,
      robots: 'noindex, follow',
    })

    expect(head.meta).toContainEqual({
      name: 'robots',
      content: 'noindex, follow',
    })
  })
})

describe('routeSocialImages', () => {
  it('exposes the home social image descriptor with the hero photo and practitioner alt text', () => {
    expect(routeSocialImages.home).toEqual({
      path: '/images/social/home.webp',
      alt: 'Katarzyna Suwalska – kosmetolog i trycholog w Ka.Cosmetology w Starogardzie Gdańskim',
      type: 'image/webp',
      width: 1200,
      height: 630,
    })
  })
})

describe('formatRouteTitle', () => {
  it('appends the brand name suffix to the route title', () => {
    expect(formatRouteTitle('Kosmetologia')).toBe(
      `Kosmetologia | ${brand.name}`,
    )
  })
})

describe('homeRouteMetadata', () => {
  it('provides the canonical home title, completeTitle, description, socialImage, and primaryImagePath', () => {
    expect(HOMEPAGE_PRIMARY_IMAGE_PATH).toBe('/images/hero.webp')
    expect(homeRouteMetadata).toEqual({
      path: '/',
      title: 'Kosmetolog i trycholog w Starogardzie Gdańskim',
      completeTitle: `Kosmetolog i trycholog w Starogardzie Gdańskim | ${brand.name}`,
      description:
        'Indywidualna kosmetologia i trychologia w Ka.Cosmetology. Poznaj specjalizacje i umów wizytę.',
      socialImage: routeSocialImages.home,
      primaryImagePath: '/images/hero.webp',
    })
  })
})
