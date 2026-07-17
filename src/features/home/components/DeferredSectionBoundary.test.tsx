import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeferredSectionBoundary } from './DeferredSectionBoundary'

function ThrowingChild(): ReactNode {
  throw new Error('technical chunk details')
}

function SuspendedChild(): ReactNode {
  throw new Promise(() => undefined)
}

describe('DeferredSectionBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders successful children without a failure alert', () => {
    render(
      <DeferredSectionBoundary sectionLabel="Galeria">
        <p>Galeria jest dostępna</p>
      </DeferredSectionBoundary>,
    )

    expect(screen.getByText('Galeria jest dostępna')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the supplied fallback while children are suspended', () => {
    render(
      <DeferredSectionBoundary
        sectionLabel="Galeria"
        loadingFallback={<p>Wczytywanie galerii</p>}
      >
        <SuspendedChild />
      </DeferredSectionBoundary>,
    )

    expect(screen.getByText('Wczytywanie galerii')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('contains a child failure without exposing technical details', () => {
    render(
      <DeferredSectionBoundary sectionLabel="Efekty zabiegów">
        <ThrowingChild />
      </DeferredSectionBoundary>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(
      'Nie udało się wczytać sekcji „Efekty zabiegów”.',
    )
    expect(alert).not.toHaveTextContent('technical chunk details')
    expect(
      screen.getByRole('button', { name: 'Odśwież stronę' }),
    ).toBeInTheDocument()
  })

  it('preserves the failed section anchor and background', () => {
    const { container } = render(
      <DeferredSectionBoundary
        sectionId="efekty"
        sectionLabel="Efekty zabiegów"
        background="gray"
      >
        <ThrowingChild />
      </DeferredSectionBoundary>,
    )

    expect(container.querySelector('#efekty')).toHaveClass('bg-surface-muted')
  })

  it('keeps a successful sibling mounted when another boundary fails', () => {
    render(
      <>
        <DeferredSectionBoundary sectionLabel="Efekty zabiegów">
          <ThrowingChild />
        </DeferredSectionBoundary>
        <DeferredSectionBoundary sectionLabel="Galeria">
          <p>Galeria jest dostępna</p>
        </DeferredSectionBoundary>
      </>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Galeria jest dostępna')).toBeInTheDocument()
  })
})
