import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'

vi.mock('../sections/HeroSection', () => ({
  default: () => <div data-testid="hero" />,
}))
vi.mock('../sections/SpecializationsSection', () => ({
  default: () => <div data-testid="specializations" />,
}))
vi.mock('../sections/AboutSection', () => ({
  default: () => <div data-testid="about" />,
}))
vi.mock('../sections/ProcessSection', () => ({
  default: () => <div data-testid="process" />,
}))
vi.mock('../sections/QuoteSection', () => ({
  default: () => <div data-testid="quote" />,
}))
vi.mock('../sections/OpinionsSection', () => ({
  default: () => <div data-testid="opinions" />,
}))
vi.mock('@features/contact/sections/ContactSection', () => ({
  default: () => <div data-testid="contact" />,
}))
vi.mock('@features/contact/sections/GoogleMap', () => ({
  default: () => <div data-testid="google-map" />,
}))

describe('HomePage', () => {
  it('renders both BeautySalon and WebPage JSON-LD schemas', () => {
    const { container } = render(<HomePage />)
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    )

    expect(scripts).toHaveLength(2)

    const schemas = Array.from(scripts).map((script) =>
      JSON.parse(script.textContent || '{}'),
    )

    const salon = schemas.find((s) => s['@type'] === 'BeautySalon')
    const webPage = schemas.find((s) => s['@type'] === 'WebPage')

    expect(salon).toBeDefined()
    expect(salon).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      '@id': 'https://kacosmetology.pl/#beautysalon',
      image: 'https://kacosmetology.pl/images/hero.webp',
      priceRange: '30-550 PLN',
    })
    expect(typeof salon.description).toBe('string')
    expect(salon.description.length).toBeGreaterThan(0)

    expect(webPage).toBeDefined()
    expect(webPage).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://kacosmetology.pl/#webpage',
      url: 'https://kacosmetology.pl/',
      about: {
        '@id': 'https://kacosmetology.pl/#beautysalon',
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        '@id': 'https://kacosmetology.pl/#primaryimage',
        url: 'https://kacosmetology.pl/images/hero.webp',
      },
    })
  })
})
