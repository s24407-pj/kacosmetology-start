import { describe, expect, it, vi } from 'vitest'

const loadedFonts = vi.hoisted(() => [] as string[])

vi.mock('@fontsource/playfair-display/latin-400.css', () => {
  loadedFonts.push('playfair latin 400')
  return {}
})
vi.mock('@fontsource/playfair-display/latin-ext-400.css', () => {
  loadedFonts.push('playfair latin-ext 400')
  return {}
})
vi.mock('@fontsource/playfair-display/latin-600.css', () => {
  loadedFonts.push('playfair latin 600')
  return {}
})
vi.mock('@fontsource/playfair-display/latin-ext-600.css', () => {
  loadedFonts.push('playfair latin-ext 600')
  return {}
})
vi.mock('@fontsource/crimson-text/latin-600.css', () => {
  loadedFonts.push('crimson latin 600')
  return {}
})
vi.mock('@fontsource/crimson-text/latin-ext-600.css', () => {
  loadedFonts.push('crimson latin-ext 600')
  return {}
})
vi.mock('@fontsource/crimson-text/latin-400-italic.css', () => {
  loadedFonts.push('crimson latin 400 italic')
  return {}
})
vi.mock('@fontsource/crimson-text/latin-ext-400-italic.css', () => {
  loadedFonts.push('crimson latin-ext 400 italic')
  return {}
})

import { loadDeferredFonts } from './loadDeferredFonts'

describe('loadDeferredFonts', () => {
  it('resolves after loading the complete deferred font sequence', async () => {
    await expect(loadDeferredFonts()).resolves.toBeUndefined()

    expect(loadedFonts).toEqual([
      'playfair latin 400',
      'playfair latin-ext 400',
      'playfair latin 600',
      'playfair latin-ext 600',
      'crimson latin 600',
      'crimson latin-ext 600',
      'crimson latin 400 italic',
      'crimson latin-ext 400 italic',
    ])
  })
})
