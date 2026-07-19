import '@testing-library/jest-dom/vitest'

import { galleryItems } from '@data/gallery'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import GallerySection from './GallerySection'

describe('GallerySection', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders a labelled, lazily loaded gallery from canonical image data', () => {
    render(<GallerySection />)

    expect(document.getElementById('gabinet')).toBeInTheDocument()
    expect(screen.getByLabelText('Galeria zdjęć')).toBeInTheDocument()

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(galleryItems.length)

    for (const item of galleryItems) {
      const image = screen.getByRole('img', { name: item.alt ?? item.title })
      expect(image).toHaveAttribute('loading', 'lazy')
    }
  })
})
