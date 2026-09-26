import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHero } from './PageHero'

describe('PageHero', () => {
  it('renders consistent page identity, supporting content and actions', () => {
    render(
      <PageHero
        eyebrow="Specjalizacja"
        title="Kosmetologia"
        description="Indywidualna opieka nad skórą."
        breadcrumbs={<nav aria-label="Okruszki">Strona główna</nav>}
        meta={<span>60 min</span>}
        actions={<a href="/rezerwacja">Umów wizytę</a>}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Kosmetologia' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Okruszki' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Umów wizytę' })).toHaveAttribute(
      'href',
      '/rezerwacja',
    )
    expect(screen.getByText('60 min')).toBeInTheDocument()
  })

  it('renders optional editorial media after the hero content', () => {
    render(
      <PageHero
        title="Trychologia"
        description="Indywidualna opieka nad skórą głowy."
        media={<img src="/trychology.webp" alt="Zabieg trychologiczny" />}
      />,
    )

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Trychologia',
    })
    const image = screen.getByRole('img', { name: 'Zabieg trychologiczny' })

    expect(image).toHaveAttribute('src', '/trychology.webp')
    const documentPosition = heading.compareDocumentPosition(image)
    expect(documentPosition & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })
})
