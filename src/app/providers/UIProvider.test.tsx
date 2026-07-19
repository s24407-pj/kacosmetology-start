import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUI } from './UIContext'
import { UIProvider } from './UIProvider'

type IOCallback = IntersectionObserverCallback

const Consumer = () => {
  const { scrolled, showScrollToTop, isMenuOpen, setIsMenuOpen } = useUI()

  return (
    <div>
      <div data-testid="scrolled">{String(scrolled)}</div>
      <div data-testid="scroll-top">{String(showScrollToTop)}</div>
      <div data-testid="menu">{String(isMenuOpen)}</div>
      <button type="button" onClick={() => setIsMenuOpen(true)}>
        open-menu
      </button>
    </div>
  )
}

describe('UIProvider', () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  let callbacks: IOCallback[] = []

  beforeEach(() => {
    callbacks = []
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin = ''
      readonly scrollMargin = ''
      readonly thresholds = []
      constructor(cb: IOCallback) {
        callbacks.push(cb)
      }
      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
      takeRecords = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    cleanup()
    vi.resetAllMocks()
    vi.unstubAllGlobals()
    callbacks = []
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
  })

  it('updates scroll flags based on scroll position', () => {
    render(
      <UIProvider>
        <Consumer />
      </UIProvider>,
    )

    expect(screen.getByTestId('scrolled')).toHaveTextContent('false')
    expect(screen.getByTestId('scroll-top')).toHaveTextContent('false')

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(screen.getByTestId('scrolled')).toHaveTextContent('true')
    expect(screen.getByTestId('scroll-top')).toHaveTextContent('true')
  })

  it('allows toggling the mobile menu state', async () => {
    const user = userEvent.setup()
    render(
      <UIProvider>
        <Consumer />
      </UIProvider>,
    )

    expect(screen.getByTestId('menu')).toHaveTextContent('false')
    await user.click(screen.getByRole('button', { name: 'open-menu' }))
    expect(screen.getByTestId('menu')).toHaveTextContent('true')
  })

  it('animates newly intersecting, intentionally marked elements', () => {
    const { container } = render(
      <UIProvider>
        <Consumer />
      </UIProvider>,
    )

    const animationCallback = callbacks[0]
    const target = document.createElement('div')
    target.dataset.revealOnScroll = ''
    container.append(target)

    act(() => {
      animationCallback?.(
        [
          {
            isIntersecting: true,
            target,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      )
    })

    expect(target).toHaveClass('animate-fade-up')
  })

  it('tracks scrolling without creating an entrance observer when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })

    render(
      <UIProvider>
        <Consumer />
      </UIProvider>,
    )

    expect(callbacks).toHaveLength(0)

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(screen.getByTestId('scrolled')).toHaveTextContent('true')
    expect(screen.getByTestId('scroll-top')).toHaveTextContent('true')
  })
})
