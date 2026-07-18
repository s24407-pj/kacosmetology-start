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

  it('returns the complete route title, description and Open Graph metadata', () => {
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
    ])
  })
})
