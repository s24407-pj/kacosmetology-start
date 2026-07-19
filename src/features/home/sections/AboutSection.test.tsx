import '@testing-library/jest-dom/vitest'
import { ABOUT_SECTION } from '@data/about'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AboutSection from './AboutSection'

describe('AboutSection', () => {
  beforeEach(() => {
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

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders the section with correct id', () => {
    const { container } = render(<AboutSection />)
    const section = container.querySelector('#o-mnie')
    expect(section).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    render(<AboutSection />)
    expect(
      screen.getByRole('heading', { name: /o\s*mnie/i }),
    ).toBeInTheDocument()
  })

  it('displays about content text', () => {
    render(<AboutSection />)
    expect(
      screen.getByText(
        /Kosmetologia i trychologia to nie tylko moja praca – to moja pasja/,
      ),
    ).toBeInTheDocument()
  })

  it('displays the professional title badge', () => {
    render(<AboutSection />)

    expect(screen.getByText('magister kosmetologii')).toBeInTheDocument()
  })

  it('displays the showcase image', () => {
    render(<AboutSection />)

    expect(
      screen.getByRole('img', { name: ABOUT_SECTION.image.alt }),
    ).toBeInTheDocument()
  })

  it('renders lead text before the image in the DOM for mobile ordering', () => {
    const { container } = render(<AboutSection />)

    const section = container.querySelector('#o-mnie')
    const leadText = section?.querySelector('p')
    const image = section?.querySelector('img')

    expect(leadText).toBeTruthy()
    expect(image).toBeTruthy()

    const position = leadText!.compareDocumentPosition(image!)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
