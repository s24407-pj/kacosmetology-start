import { brand } from '@data/business'
import { describe, expect, it } from 'vitest'
import { toBlogPostingJsonLd, toBreadcrumbListJsonLd } from './businessMetadata'

describe('toBlogPostingJsonLd', () => {
  it('serializes article fields with cover image and modified date', () => {
    const jsonLd = toBlogPostingJsonLd({
      brand,
      path: '/blog/przyklad',
      post: {
        title: 'Tytuł',
        excerpt: 'Opis',
        publishedAt: '2026-07-20',
        updatedAt: '2026-07-21',
        category: { label: 'Pielęgnacja skóry' },
        tags: [{ label: 'Retinoidy' }],
        coverImage: {
          src: '/images/blog/przyklad/cover.webp',
          alt: 'Okładka',
        },
        seo: { description: 'SEO opis' },
      },
    })

    expect(jsonLd).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Tytuł',
      description: 'SEO opis',
      datePublished: '2026-07-20',
      dateModified: '2026-07-21',
      articleSection: 'Pielęgnacja skóry',
      keywords: 'Retinoidy',
      author: { name: brand.practitionerName },
      publisher: { name: brand.name },
    })
    expect(jsonLd.image).toBe(
      'https://kacosmetology.pl/images/blog/przyklad/cover.webp',
    )
  })

  it('falls back to brand logo and excerpt without optional fields', () => {
    const jsonLd = toBlogPostingJsonLd({
      brand,
      path: '/blog/przyklad',
      post: {
        title: 'Tytuł',
        excerpt: 'Opis',
        publishedAt: '2026-07-20',
        category: { label: 'Pielęgnacja skóry' },
        tags: [],
      },
    })
    expect(jsonLd.description).toBe('Opis')
    expect(jsonLd.image).toBe('https://kacosmetology.pl/images/logo.webp')
    expect(jsonLd).not.toHaveProperty('dateModified')
  })
})

describe('toBreadcrumbListJsonLd', () => {
  it('builds breadcrumb items for blog routes', () => {
    expect(
      toBreadcrumbListJsonLd({
        brand,
        items: [
          { name: 'Strona główna', path: '/' },
          { name: 'Blog', path: '/blog' },
        ],
      }).itemListElement,
    ).toHaveLength(2)
  })
})
