import '@testing-library/jest-dom/vitest'
import { getServiceById } from '@data/services'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string
    params: { slug: string }
  }) => (
    <a href={to.replace('$slug', params.slug)} {...props}>
      {children}
    </a>
  ),
}))

import { ServiceCard } from './ServiceCard'

function renderCard(serviceId: Parameters<typeof getServiceById>[0]) {
  const service = getServiceById(serviceId)
  expect(service).toBeDefined()
  if (!service) throw new Error(`Missing test service ${serviceId}`)
  render(<ServiceCard service={service} />)
}

describe('ServiceCard', () => {
  afterEach(cleanup)

  it.each([
    ['service-oczyszczanie-wodorowe', '/kosmetologia/oczyszczanie-wodorowe'],
    ['service-regulacja-brwi', '/oprawa-oka/regulacja-brwi'],
    [
      'service-pierwsza-konsultacja-trychologiczna',
      '/trychologia/pierwsza-konsultacja-trychologiczna',
    ],
  ] as const)(
    'maps %s to its specialization detail route',
    (serviceId, href) => {
      renderCard(serviceId)

      expect(
        screen.getByRole('link', { name: /Poznaj szczegóły/ }),
      ).toHaveAttribute('href', href)
    },
  )

  it('uses the Booksy fallback when a service has no public detail page', () => {
    renderCard('service-konsultacja-kosmetologiczna-online')

    expect(
      screen.getByRole('link', {
        name: 'Zarezerwuj w Booksy (otwiera nową kartę)',
      }),
    ).toHaveAttribute('href', 'https://kacosmetology.booksy.com')
    expect(
      screen.queryByRole('link', { name: /Poznaj szczegóły/ }),
    ).not.toBeInTheDocument()
  })

  it('exposes the reveal variant and requested stagger delay', () => {
    const service = getServiceById('service-oczyszczanie-wodorowe')
    expect(service).toBeDefined()
    if (!service) return

    const { container } = render(
      <ServiceCard service={service} revealDelay={2} />,
    )
    expect(container.querySelector('article')).toHaveAttribute(
      'data-reveal-variant',
      'scale',
    )
    expect(container.querySelector('article')).toHaveAttribute(
      'data-reveal-delay',
      '2',
    )
  })
})
