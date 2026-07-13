import '@testing-library/jest-dom/vitest'
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

  it('renders opinion cards', () => {
    const { container } = render(<OpinionsSection />)
    const cards = container.querySelectorAll('article')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('displays opinion content with quotes', () => {
    render(<OpinionsSection />)
    const quotes = screen.getAllByText(/„/)
    expect(quotes.length).toBeGreaterThan(0)
  })

  it('displays author names in opinions', () => {
    const { container } = render(<OpinionsSection />)
    const authorElements = container.querySelectorAll('footer p')
    expect(authorElements.length).toBeGreaterThan(0)
  })

  it('renders quote icons in cards', () => {
    const { container } = render(<OpinionsSection />)
    const quoteIcons = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(quoteIcons.length).toBeGreaterThan(0)
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
    render(<OpinionsSection />)
    expect(screen.getByText('Booksy')).toBeInTheDocument()
    expect(screen.getByText('Google Maps')).toBeInTheDocument()
  })
})
