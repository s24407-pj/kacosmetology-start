import '@testing-library/jest-dom/vitest'
import { opinions } from '@data/opinions'
import { platformStats } from '@data/platformStats'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OpinionsSection from './OpinionsSection'

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(function IntersectionObserverMock() {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  }),
)

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia,
})

describe('OpinionsSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the section with correct id', () => {
    const { container } = render(<OpinionsSection />)
    const section = container.querySelector('#opinie')
    expect(section).toBeInTheDocument()
  })

  it('displays section heading "Opinie"', () => {
    render(<OpinionsSection />)
    expect(screen.getByText('Opinie')).toBeInTheDocument()
  })

  it('displays section subtitle', () => {
    render(<OpinionsSection />)
    expect(
      screen.getByText(/Wasze słowa są najlepszą rekomendacją mojej pracy/),
    ).toBeInTheDocument()
  })

  it('renders all opinion cards', () => {
    const { container } = render(<OpinionsSection />)
    const cards = container.querySelectorAll('article')
    expect(cards).toHaveLength(opinions.length)
  })

  it('displays every opinion, author and source detail', () => {
    render(<OpinionsSection />)
    for (const opinion of opinions) {
      expect(screen.getByText(`„${opinion.content}”`)).toBeInTheDocument()
      expect(screen.getByText(opinion.author)).toBeInTheDocument()
      if (opinion.service) {
        expect(screen.getByText(opinion.service)).toBeInTheDocument()
      }
      if (opinion.source) {
        expect(screen.getByText(opinion.source)).toBeInTheDocument()
      }
    }
  })

  it('renders Booksy stats card', () => {
    render(<OpinionsSection />)
    expect(screen.getByText('Booksy')).toBeInTheDocument()
    expect(screen.getByText('opinie')).toBeInTheDocument()
  })

  it('renders Google Maps stats card', () => {
    render(<OpinionsSection />)
    expect(screen.getByText('Google Maps')).toBeInTheDocument()
    expect(screen.getByText('opinie')).toBeInTheDocument()
  })

  it('renders two platform stat cards', () => {
    const { container } = render(<OpinionsSection />)
    const statCards = platformStats.map((stat) =>
      screen.getByText(stat.name).closest('.shadow-subtle'),
    )
    expect(statCards).toHaveLength(2)
    expect(statCards.every(Boolean)).toBe(true)
    expect(
      container.querySelectorAll('[aria-label="Ocena: 5 gwiazdek"]'),
    ).toHaveLength(platformStats.length + opinions.length)
  })

  it('renders the thank-you signature with a decorative heart', () => {
    render(<OpinionsSection />)
    const signature = screen.getByText('Dziękuję').parentElement
    const heart = signature?.querySelector('svg')

    expect(signature).toHaveAttribute('data-reveal-on-scroll')
    expect(heart).toHaveAttribute('aria-hidden', 'true')
    expect(heart?.querySelector('.opinions-heart-path')).toBeInTheDocument()
  })
})
