import '@testing-library/jest-dom/vitest'
import { getServicesByArea } from '@data/services'
import { getSpecialization } from '@data/specializations'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string
    params?: { slug: string }
  }) => (
    <a href={params ? to.replace('$slug', params.slug) : to} {...props}>
      {children}
    </a>
  ),
}))

import { SpecializationPage } from './SpecializationPage'

describe('SpecializationPage', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it.each([
    [
      'cosmetology',
      'Kosmetologia',
      'Świadoma opieka nad skórą',
      'Umów konsultację (otwiera nową kartę)',
      'Zabieg pielęgnacyjny twarzy z aplikacją maski w gabinecie',
      '/images/specializations/cosmetology-720.webp',
      true,
    ],
    [
      'eye-styling',
      'Oprawa oka',
      'Naturalnie podkreślone spojrzenie',
      'Umów wizytę (otwiera nową kartę)',
      'Naturalna oprawa oka z widoczną brwią i rzęsami',
      '/images/specializations/eye-styling-720.webp',
      false,
    ],
    [
      'trichology',
      'Trychologia',
      'Indywidualna opieka nad skórą głowy',
      'Umów konsultację (otwiera nową kartę)',
      'Mycie i masaż skóry głowy podczas zabiegu w salonie',
      '/images/specializations/trichology-720.webp',
      true,
    ],
  ] as const)(
    'renders the selected %s specialization and its service groups',
    (specializationId, title, eyebrow, heroAction, heroImageAlt, heroImageSrc, includesOnline) => {
      render(<SpecializationPage specializationId={specializationId} />)

      expect(
        screen.getByRole('heading', { level: 1, name: title }),
      ).toBeVisible()
      expect(screen.getByText(eyebrow)).toBeVisible()
      expect(screen.getByRole('link', { name: heroAction })).toHaveAttribute(
        'href',
        'https://kacosmetology.booksy.com',
      )

      const heroImage = screen.getByRole('img', { name: heroImageAlt })
      expect(heroImage).toHaveAttribute('src', heroImageSrc)
      expect(heroImage).toHaveAttribute('loading', 'eager')
      expect(heroImage.className).toContain('absolute')
      expect(heroImage.className).not.toContain('rounded')
      expect(heroImage.className).not.toContain('shadow')

      const specialization = getSpecialization(specializationId)
      expect(specialization).toBeDefined()
      if (!specialization) return
      const services = getServicesByArea(specialization.area).filter(
        (service) =>
          service.isPublished && service.category === specialization.category,
      )
      const featuredSection = screen
        .queryByRole('heading', { name: 'Polecane na początek' })
        ?.closest('section')
      for (const service of services.filter((item) => item.featured)) {
        expect(featuredSection).not.toBeNull()
        expect(
          within(featuredSection as HTMLElement).getByText(service.name),
        ).toBeVisible()
      }

      const fullOffer = screen
        .getByRole('heading', { name: 'Pełna oferta' })
        .closest('section')
      expect(fullOffer).not.toBeNull()
      for (const service of services.filter((item) => !item.featured)) {
        expect(
          within(fullOffer as HTMLElement).getByText(service.name),
        ).toBeVisible()
      }

      if (includesOnline) {
        const onlineSection = screen
          .getByRole('heading', { name: 'Konsultacja online' })
          .closest('section')
        expect(onlineSection).not.toBeNull()
        for (const service of getServicesByArea(specialization.area).filter(
          (item) => item.isPublished && item.category === 'online',
        )) {
          expect(
            within(onlineSection as HTMLElement).getByText(service.name),
          ).toBeVisible()
        }
      } else {
        expect(
          screen.queryByRole('heading', { name: 'Konsultacja online' }),
        ).not.toBeInTheDocument()
        for (const service of getServicesByArea(specialization.area).filter(
          (item) => item.isPublished && item.category === 'online',
        )) {
          expect(screen.queryByText(service.name)).not.toBeInTheDocument()
        }
      }
      expect(
        screen.getByRole('link', {
          name: 'Przejdź do Booksy (otwiera nową kartę)',
        }),
      ).toHaveAttribute('href', 'https://kacosmetology.booksy.com')
    },
  )
})
