import '@testing-library/jest-dom/vitest'
import { RenderTimeProvider } from '@context/RenderTimeProvider'
import { getServiceById } from '@data/services'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ServicePrice } from './ServicePrice'

function renderPrice(
  serviceId: Parameters<typeof getServiceById>[0],
  at: string,
) {
  const service = getServiceById(serviceId)
  expect(service).toBeDefined()
  if (!service) throw new Error(`Missing test service ${serviceId}`)

  render(
    <RenderTimeProvider snapshot={{ mode: 'fixed', timestamp: at }}>
      <ServicePrice service={service} />
    </RenderTimeProvider>,
  )
}

describe('ServicePrice', () => {
  afterEach(cleanup)

  it('renders the regular service price outside a promotion', () => {
    renderPrice('service-oczyszczanie-wodorowe', '2025-08-15T12:00:00.000Z')

    expect(
      screen.getByLabelText('Cena usługi Oczyszczanie wodorowe'),
    ).toHaveTextContent('250 zł')
    expect(screen.queryByText(/Najniższa cena/)).not.toBeInTheDocument()
  })

  it('renders the crossed-out standard price and promoted price', () => {
    renderPrice('service-oczyszczanie-wodorowe', '2025-09-15T12:00:00.000Z')

    const standardPrice = screen.getByText('250 zł')
    expect(standardPrice).toHaveClass('line-through')
    expect(
      screen.getByLabelText('Cena usługi Oczyszczanie wodorowe'),
    ).toHaveTextContent('250 zł200 zł')
  })

  it('discloses the lowest price from the 30 days before the reduction', () => {
    renderPrice('service-oczyszczanie-wodorowe', '2025-10-15T12:00:00.000Z')

    expect(
      screen.getByText('Najniższa cena z 30 dni przed obniżką: 200 zł'),
    ).toBeInTheDocument()
  })
})
