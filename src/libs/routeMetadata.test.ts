import { brand } from '@data/business'
import { describe, expect, it } from 'vitest'
import { createRouteHead } from './routeMetadata'

describe('createRouteHead', () => {
  it('resolves route paths against the canonical site URL', () => {
    const head = createRouteHead({
      path: '/kosmetologia/oczyszczanie-wodorowe',
      title: 'Oczyszczanie wodorowe',
      description: 'Opis usługi.',
    })

    expect(head.links).toEqual([
      {
        rel: 'canonical',
        href: 'https://kacosmetology.pl/kosmetologia/oczyszczanie-wodorowe',
      },
    ])
  })

  it('returns title, description and a single Open Graph set for website routes', () => {
    const description = 'Efekty zabiegów i wnętrze gabinetu.'
    const head = createRouteHead({
      path: '/galeria',
      title: 'Galeria',
      description,
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
      { property: 'og:type', content: 'website' },
      {
        property: 'og:image',
        content: 'https://kacosmetology.pl/images/logo.webp',
      },
      {
        property: 'og:image:alt',
        content: brand.logo.imageAlt,
      },
    ])
  })

  it('emits article Open Graph fields without duplicate type or image keys', () => {
    const head = createRouteHead({
      path: '/blog/przyklad',
      title: 'Przykład',
      description: 'Opis',
      ogType: 'article',
      publishedTime: '2026-07-20',
      modifiedTime: '2026-07-21',
      section: 'Pielęgnacja skóry',
      tags: ['Retinoidy'],
      image: {
        url: 'https://kacosmetology.pl/images/blog/przyklad/cover.webp',
        alt: 'Okładka',
      },
    })

    const properties = head.meta
      .map((entry) =>
        'property' in entry && typeof entry.property === 'string'
          ? entry.property
          : null,
      )
      .filter(Boolean)

    expect(properties.filter((value) => value === 'og:type')).toEqual([
      'og:type',
    ])
    expect(properties.filter((value) => value === 'og:image')).toEqual([
      'og:image',
    ])
    expect(head.meta).toContainEqual({
      property: 'og:type',
      content: 'article',
    })
    expect(head.meta).toContainEqual({
      property: 'og:image',
      content: 'https://kacosmetology.pl/images/blog/przyklad/cover.webp',
    })
    expect(head.meta).toContainEqual({
      property: 'article:published_time',
      content: '2026-07-20',
    })
  })
})
