import '@testing-library/jest-dom/vitest'
import type { PublicService } from '@app-types/types'
import { getServiceById } from '@data/services'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { trackPlausibleEvent } = vi.hoisted(() => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({ trackPlausibleEvent }))
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

import { ServiceDetailPage } from './ServiceDetailPage'

function getTestService(): PublicService {
  const service = getServiceById('service-regulacja-brwi')
  expect(service).toBeDefined()
  if (!service) throw new Error('Missing detail-page test service')
  return {
    ...service,
    forWho: 'Dla osób, które chcą zadbać o kształt brwi.',
    preparation: ['Nie nakładaj makijażu na brwi.'],
    includes: ['Konsultację i regulację.'],
    effects: ['Naturalnie uporządkowany łuk brwiowy.'],
    recommendedTests: ['Próba uczuleniowa.'],
    requiresPriorConsultation: true,
    note: 'Przekaż informację o podrażnieniach.',
    contraindications: ['Aktywne podrażnienie skóry.'],
    relatedServiceIds: [
      'service-lifting-rzes-farbka',
      'service-konsultacja-kosmetologiczna-online',
    ],
  }
}

describe('ServiceDetailPage', () => {
  afterEach(() => {
    cleanup()
    trackPlausibleEvent.mockReset()
  })

  it('composes optional service content, breadcrumbs and structured data', () => {
    const service = getTestService()
    const { container } = render(<ServiceDetailPage service={service} />)

    const breadcrumbs = screen.getByRole('navigation', { name: 'Okruszki' })
    expect(
      within(breadcrumbs).getByRole('link', { name: 'Oprawa oka' }),
    ).toHaveAttribute('href', '/oprawa-oka')
    expect(within(breadcrumbs).getByText(service.name)).toHaveAttribute(
      'aria-current',
      'page',
    )

    for (const heading of [
      'Dla kogo?',
      'Przygotowanie',
      'Co obejmuje usługa',
      'Możliwe efekty',
      'Zalecane badania',
      'Wymagana wcześniejsza konsultacja',
      'Ważna informacja',
      'Przeciwwskazania',
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument()
    }

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const structuredData = JSON.parse(script?.textContent ?? 'null')
    expect(structuredData).toHaveLength(2)
    expect(structuredData[0]).toMatchObject({
      '@type': 'Service',
      name: service.name,
      url: 'https://kacosmetology.pl/oprawa-oka/regulacja-brwi',
    })
    expect(structuredData[1]).toMatchObject({ '@type': 'BreadcrumbList' })
  })

  it('filters non-routable related services and tracks views and related clicks', () => {
    const service = getTestService()
    render(<ServiceDetailPage service={service} />)

    expect(trackPlausibleEvent).toHaveBeenCalledWith('Service Detail View', {
      area: service.area,
      serviceId: service.id,
      serviceSlug: service.slug,
    })
    const relatedLink = screen.getByRole('link', {
      name: /Lifting rzęs \+ farbka/,
    })
    expect(relatedLink).toHaveAttribute(
      'href',
      '/oprawa-oka/lifting-rzes-farbka',
    )
    expect(
      screen.queryByText('Konsultacja kosmetologiczna online'),
    ).not.toBeInTheDocument()

    fireEvent.click(relatedLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Related Service Click', {
      serviceId: 'service-lifting-rzes-farbka',
      area: 'cosmetology',
    })
  })
})
