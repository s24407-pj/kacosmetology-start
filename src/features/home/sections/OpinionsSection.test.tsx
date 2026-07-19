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

  it('renders the opinions heading and an article for every canonical opinion', () => {
    render(<OpinionsSection />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Opinie' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(opinions.length)
  })

  it('labels every canonical opinion and platform rating widget', () => {
    render(<OpinionsSection />)

    expect(
      screen.getAllByRole('img', { name: 'Ocena: 5 gwiazdek' }),
    ).toHaveLength(platformStats.length + opinions.length)
  })
})
