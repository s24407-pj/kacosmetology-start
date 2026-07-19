import '@testing-library/jest-dom/vitest'

import { galleryItems } from '@data/gallery'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import GallerySection from './GallerySection'

describe('GallerySection', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders the section with correct id', () => {
    render(<GallerySection />)

    expect(document.getElementById('gabinet')).toBeInTheDocument()
    expect(screen.getByLabelText('Galeria zdjęć')).toBeInTheDocument()
  })

  it('renders all gallery images', () => {
    render(<GallerySection />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(galleryItems.length)
    expect(images[0].closest('figure')).toHaveAttribute(
      'data-reveal-variant',
      'scale',
    )
  })

  it('does not lift gallery cards on hover', () => {
    render(<GallerySection />)

    expect(screen.getAllByRole('img')[0].closest('figure')).not.toHaveClass(
      'hover:-translate-y-1',
    )
  })

  it('renders images with correct alt text', () => {
    render(<GallerySection />)

    for (const item of galleryItems) {
      expect(
        screen.getByRole('img', { name: item.alt ?? item.title }),
      ).toBeInTheDocument()
    }
  })
})
