import { describe, expect, it } from 'vitest'
import {
  GALLERY_WIDTHS,
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  POSTER_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from './responsiveImage'

describe('responsiveImage', () => {
  it('builds srcSet from base webp path', () => {
    expect(webpSrcSet('/images/hero.webp', MOBILE_WIDTHS)).toBe(
      '/images/hero-360.webp 360w, /images/hero-720.webp 720w, /images/hero-1080.webp 1080w',
    )
  })

  it('builds fallback src for a given width', () => {
    expect(webpFallbackSrc('/movies/konsultacja-poster.webp', 720)).toBe(
      '/movies/konsultacja-poster-720.webp',
    )
  })

  it('uses custom widths for gallery assets', () => {
    expect(
      webpSrcSet('/images/gallery/witryna.webp', GALLERY_WIDTHS),
    ).toContain('/images/gallery/witryna-1440.webp 1440w')
  })

  it('exposes layout sizes for key sections', () => {
    expect(IMAGE_SIZES.hero).toContain('810px')
    expect(IMAGE_SIZES.effects).toContain('32rem')
    expect(POSTER_WIDTHS).toEqual([360, 720])
  })
})
