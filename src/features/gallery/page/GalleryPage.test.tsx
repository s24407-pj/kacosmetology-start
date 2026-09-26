import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@features/home/sections/EffectsGallerySection', () => ({
  default: () => <section id="efekty">Efekty zabiegów</section>,
}))
vi.mock('@features/home/sections/GallerySection', () => ({
  default: () => <section id="gabinet">Gabinet</section>,
}))

import GalleryPage from './GalleryPage'

describe('GalleryPage', () => {
  it('server-renders the hero and both gallery sections', () => {
    const html = renderToString(<GalleryPage />)

    expect(html).toMatch(/<h1[^>]*>[^<]*Galeria/)
    expect(html).toContain('id="efekty"')
    expect(html).toContain('id="gabinet"')
    expect(html.indexOf('id="efekty"')).toBeLessThan(
      html.indexOf('id="gabinet"'),
    )
    expect(html).not.toContain('Ładowanie galerii')
  })
})
