import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@hooks/useScrollDepthTracking', () => ({
  useScrollDepthTracking: vi.fn(),
}))
vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: '/', hash: '' } }),
}))
vi.mock('../sections/HeroSection', () => ({
  default: () => <section>Hero</section>,
}))
vi.mock('../sections/AboutSection', () => ({
  default: () => <section>O mnie</section>,
}))
vi.mock('../sections/ProcessSection', () => ({
  default: () => <section>Proces</section>,
}))
vi.mock('../sections/SpecializationsSection', () => ({
  default: () => <section>Kosmetologia i Trychologia</section>,
}))
vi.mock('../sections/QuoteSection', () => ({
  default: () => <section>Holistycznie znaczy czule.</section>,
}))
vi.mock('../sections/OpinionsSection', () => ({
  default: () => <section>Opinie</section>,
}))
vi.mock('@features/contact/sections/ContactSection', () => ({
  default: () => <section>Kontakt</section>,
}))
vi.mock('@features/contact/sections/GoogleMap', () => ({
  default: () => <section>Mapa Google</section>,
}))

import HomePage from './HomePage'

describe('HomePage', () => {
  afterEach(cleanup)

  it('is a compact brand landing without the full service catalog or gallery', async () => {
    render(<HomePage />)
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Kosmetologia i Trychologia')).toBeInTheDocument()
    expect(screen.getByText('Holistycznie znaczy czule.')).toBeInTheDocument()
    expect(await screen.findByText('Mapa Google')).toBeInTheDocument()
    expect(screen.queryByText('ServicesSection')).not.toBeInTheDocument()
    expect(screen.queryByText('Galeria')).not.toBeInTheDocument()
  })
})
