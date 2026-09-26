import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../sections/HeroSection', () => ({
  default: () => <section id="hero">Hero</section>,
}))
vi.mock('../sections/AboutSection', () => ({
  default: () => <section id="o-mnie">O mnie</section>,
}))
vi.mock('../sections/ProcessSection', () => ({
  default: () => <section>Proces</section>,
}))
vi.mock('../sections/SpecializationsSection', () => ({
  default: () => <section>Kosmetologia i Trychologia</section>,
}))
vi.mock('../sections/QuoteSection', () => ({
  default: () => <section>Holistycznie znaczy czule.</section>,
}))
vi.mock('../sections/OpinionsSection', () => ({
  default: () => <section id="opinie">Opinie</section>,
}))
vi.mock('@features/contact/sections/ContactSection', () => ({
  default: () => <section id="kontakt">Kontakt</section>,
}))
vi.mock('@features/contact/sections/GoogleMap', () => ({
  default: () => <section>Mapa Google</section>,
}))

import HomePage from './HomePage'

describe('HomePage', () => {
  it('server-renders every home section in document order', () => {
    const html = renderToString(<HomePage />)

    const sections = [
      'Hero',
      'Kosmetologia i Trychologia',
      'O mnie',
      'Proces',
      'Holistycznie znaczy czule.',
      'id="opinie"',
      'id="kontakt"',
      'Mapa Google',
    ]
    const positions = sections.map((text) => html.indexOf(text))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('server-renders the BeautySalon structured data', () => {
    const html = renderToString(<HomePage />)

    expect(html).toContain('<script type="application/ld+json">')
    expect(html).toContain('"@type":"BeautySalon"')
  })
})
