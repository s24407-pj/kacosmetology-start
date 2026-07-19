import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import EffectsGallerySection from './EffectsGallerySection'

const TOTAL_EFFECTS = 7

describe('EffectsGallerySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the section with heading', () => {
    render(<EffectsGallerySection />)

    expect(screen.getByText('Efekty zabiegów')).toBeInTheDocument()
  })

  it('displays the first effect image by default', () => {
    render(<EffectsGallerySection />)

    const image = screen.getByAltText('Efekt zabiegu kosmetologicznego numer 1')
    expect(image).toHaveAttribute(
      'src',
      '/images/gallery/effects/image1-720.webp',
    )
  })

  it('displays the counter showing current position', () => {
    render(<EffectsGallerySection />)

    expect(screen.getByText(`1 / ${TOTAL_EFFECTS}`)).toBeInTheDocument()
  })

  it('displays navigation buttons', () => {
    render(<EffectsGallerySection />)

    expect(screen.getByLabelText('Poprzedni efekt')).toBeInTheDocument()
    expect(screen.getByLabelText('Następny efekt')).toBeInTheDocument()
  })

  it('displays dot indicators for all 7 effects', () => {
    render(<EffectsGallerySection />)

    const dots = screen.getAllByRole('button', { name: /Przejdź do efektu/ })
    expect(dots).toHaveLength(TOTAL_EFFECTS)
  })

  it('wraps around to last effect when previous is clicked on first', async () => {
    const user = userEvent.setup()
    render(<EffectsGallerySection />)

    const prevButton = screen.getByLabelText('Poprzedni efekt')
    await user.click(prevButton)

    expect(
      screen.getByText(`${TOTAL_EFFECTS} / ${TOTAL_EFFECTS}`),
    ).toBeInTheDocument()
  })

  it('wraps around to first effect when next is clicked on last', async () => {
    const user = userEvent.setup()
    render(<EffectsGallerySection />)

    const nextButton = screen.getByLabelText('Następny efekt')

    for (let i = 0; i < TOTAL_EFFECTS - 1; i++) {
      await user.click(nextButton)
    }

    expect(
      screen.getByText(`${TOTAL_EFFECTS} / ${TOTAL_EFFECTS}`),
    ).toBeInTheDocument()

    await user.click(nextButton)

    expect(screen.getByText(`1 / ${TOTAL_EFFECTS}`)).toBeInTheDocument()
  })

  it('navigates to specific effect when dot is clicked', async () => {
    const user = userEvent.setup()
    render(<EffectsGallerySection />)

    const dots = screen.getAllByRole('button', { name: /Przejdź do efektu/ })
    await user.click(dots[2])

    expect(screen.getByText(`3 / ${TOTAL_EFFECTS}`)).toBeInTheDocument()
  })

  it('adds a brief visual transition when the active image changes', async () => {
    const user = userEvent.setup()
    render(<EffectsGallerySection />)

    await user.click(screen.getByLabelText('Następny efekt'))

    expect(screen.getByRole('img')).toHaveClass('gallery-slide-enter')
  })

  it('disables automatic slide changes with reduced motion while retaining manual navigation', () => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
    render(<EffectsGallerySection />)

    act(() => vi.advanceTimersByTime(15_000))
    expect(screen.getByText(`1 / ${TOTAL_EFFECTS}`)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Następny efekt'))
    expect(screen.getByText(`2 / ${TOTAL_EFFECTS}`)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('has accessible button labels', () => {
    render(<EffectsGallerySection />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toHaveAccessibleName()
    })
  })
})
