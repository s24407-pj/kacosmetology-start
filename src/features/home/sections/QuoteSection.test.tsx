import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import QuoteSection from './QuoteSection'

const quote = 'Holistycznie znaczy czule.'

describe('QuoteSection', () => {
  it('renders the holistic brand quote without attribution', () => {
    render(<QuoteSection />)

    expect(screen.getByText(quote)).toBeInTheDocument()
    expect(screen.queryByText('Platon, Charmides')).not.toBeInTheDocument()
  })

  it('does not expose an id because it is not a navigation target', () => {
    const { container } = render(<QuoteSection />)

    expect(container.querySelector('section')).not.toHaveAttribute('id')
  })

  it('uses the strong CTA color treatment', () => {
    const { container } = render(<QuoteSection />)
    const section = container.querySelector('section')

    expect(section).toHaveClass('bg-action')
    expect(within(section!).getByText(quote)).toHaveClass('text-white')
  })

  it('renders a decorative Vitruvian Man watermark behind the quote', () => {
    const { container } = render(<QuoteSection />)

    const watermark = container.querySelector(
      'img[src="/images/vitruvian-man-320.webp"]',
    )
    expect(watermark).toBeInTheDocument()
    expect(watermark).toHaveAttribute('alt', '')
    expect(watermark).toHaveAttribute('loading', 'lazy')
    expect(watermark).toHaveAttribute(
      'srcset',
      '/images/vitruvian-man-320.webp 320w, /images/vitruvian-man-640.webp 640w',
    )
  })
})
