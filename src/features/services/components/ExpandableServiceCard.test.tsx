import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@data/promotion', async () => {
  const actual =
    await vi.importActual<typeof import('@data/promotion')>('@data/promotion')

  return {
    getAllActivePromotions: vi.fn(),
    resolveServicePromotion: vi.fn(actual.resolveServicePromotion),
  }
})

vi.mock('@libs/priceHistory', () => ({
  getLowestPriceInLastDays: vi.fn(),
}))

vi.mock('@data/servicePriceHistory', () => ({
  getServicePriceHistory: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@context/RenderTimeProvider', () => ({
  useRenderTime: () => new Date('2025-09-15T12:00:00.000Z'),
}))

const promotionModule = await import('@data/promotion')
const priceHistoryModule = await import('@libs/priceHistory')
const servicePriceHistoryModule = await import('@data/servicePriceHistory')

const getAllActivePromotionsMock = vi.mocked(
  promotionModule.getAllActivePromotions,
)
const resolveServicePromotionMock = vi.mocked(
  promotionModule.resolveServicePromotion,
)
const getLowestPriceInLastDaysMock = vi.mocked(
  priceHistoryModule.getLowestPriceInLastDays,
)
const getServicePriceHistoryMock = vi.mocked(
  servicePriceHistoryModule.getServicePriceHistory,
)

import type { Service } from '@app-types/types'
import { primarySalonLocation } from '@data/business'
import type { ActivePromotion, PromotionApplicability } from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import ExpandableServiceCard from './ExpandableServiceCard'

describe('ExpandableServiceCard', () => {
  const service: Service = {
    id: 'service-test-service',
    name: 'Test Service',
    catalogCategory: 'Kosmetologia',
    price: 250,
    duration: 75,
    isNext: false,
    description: 'Pełny opis zabiegu',
    forWho: 'Dla każdego',
    note: 'Uwaga testowa',
    preparation: ['Przygotuj się'],
    effects: ['Piękna skóra'],
  }

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    getAllActivePromotionsMock.mockReturnValue([])
    getServicePriceHistoryMock.mockReturnValue([
      { value: 250, changedAt: '2025-07-01T08:00:00.000Z' },
    ])
  })

  it('renders discounted pricing details when a promotion applies', () => {
    const promotion: ActivePromotion = {
      id: 'october-2025-oczyszczanie-wodorowe',
      discountPercentage: 20,
      startDate: new Date('2025-09-01T00:00:00.000Z'),
      endDate: new Date('2025-09-30T23:59:59.999Z'),
      applicability: {
        type: 'all',
        description: 'wszystkie zabiegi',
      } as PromotionApplicability,
      ctaLabel: 'Zarezerwuj',
    }

    getAllActivePromotionsMock.mockReturnValue([promotion])
    getLowestPriceInLastDaysMock.mockReturnValue(180)

    render(
      <ExpandableServiceCard
        service={service}
        isExpanded={false}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByText('250 zł')).toBeInTheDocument()
    expect(screen.getByText('200 zł')).toBeInTheDocument()
    expect(
      screen.getByText('Najniższa cena (30 dni): 180 zł'),
    ).toBeInTheDocument()

    expect(getServicePriceHistoryMock).toHaveBeenCalledWith(
      'service-test-service',
    )
    expect(getLowestPriceInLastDaysMock).toHaveBeenCalledWith(
      [{ value: 250, changedAt: '2025-07-01T08:00:00.000Z' }],
      30,
      new Date('2025-09-01T00:00:00.000Z'),
    )
  })

  it('shows the winning offer in either order and uses its start for history', () => {
    const weakerPromotion: ActivePromotion = {
      id: 'synthetic-weaker',
      discountPercentage: 15,
      startDate: new Date('2025-09-01T00:00:00.000Z'),
      endDate: new Date('2025-09-30T23:59:59.999Z'),
      applicability: {
        type: 'all',
        description: 'wszystkie zabiegi',
      },
      ctaLabel: 'Zarezerwuj',
    }
    const strongerPromotion: ActivePromotion = {
      ...weakerPromotion,
      id: 'synthetic-stronger',
      discountPercentage: 20,
      startDate: new Date('2025-09-05T00:00:00.000Z'),
    }
    const activePromotions = [weakerPromotion, strongerPromotion]
    getAllActivePromotionsMock.mockReturnValue(activePromotions)
    getLowestPriceInLastDaysMock.mockReturnValue(180)

    const view = render(
      <ExpandableServiceCard
        service={service}
        isExpanded={false}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByText('200 zł')).toBeInTheDocument()
    expect(resolveServicePromotionMock).toHaveBeenCalledWith(
      service,
      activePromotions,
    )
    expect(getLowestPriceInLastDaysMock).toHaveBeenLastCalledWith(
      [{ value: 250, changedAt: '2025-07-01T08:00:00.000Z' }],
      30,
      strongerPromotion.startDate,
    )

    const reversedPromotions = [...activePromotions].reverse()
    getAllActivePromotionsMock.mockReturnValue(reversedPromotions)
    view.rerender(
      <ExpandableServiceCard
        service={service}
        isExpanded={false}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByText('200 zł')).toBeInTheDocument()
    expect(resolveServicePromotionMock).toHaveBeenLastCalledWith(
      service,
      reversedPromotions,
    )
    expect(getServicePriceHistoryMock).toHaveBeenCalledWith(service.id)
  })

  it('supports toggling via mouse and keyboard interactions', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(
      <ExpandableServiceCard
        service={service}
        isExpanded={true}
        onToggle={onToggle}
      />,
    )

    const card = screen.getByRole('button', { name: /Test Service/i })
    const serviceHeading = screen.getByRole('heading', {
      name: service.name,
    })
    const detailsId = card.getAttribute('aria-controls')

    expect(serviceHeading).toBeInTheDocument()
    expect(detailsId).toBe(`details-${service.id}`)
    expect(document.getElementById(detailsId ?? '')).toBeInTheDocument()

    await user.click(card)
    expect(onToggle).toHaveBeenCalledTimes(1)

    card.focus()
    await user.keyboard('{Enter}')
    await user.keyboard('[Space]')

    expect(onToggle).toHaveBeenCalledTimes(3)
    expect(
      screen.getByRole('heading', { name: 'Opis zabiegu' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Dla każdego')).toBeInTheDocument()
    expect(screen.getByText('Uwaga testowa')).toBeInTheDocument()
    expect(screen.getByText('Przygotuj się')).toBeInTheDocument()
    expect(screen.getByText('Piękna skóra')).toBeInTheDocument()
  })

  it('renders forWho quick-view in collapsed state and removes it when expanded', () => {
    const { rerender } = render(
      <ExpandableServiceCard
        service={service}
        isExpanded={false}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByText('Dla każdego')).toBeInTheDocument()

    rerender(
      <ExpandableServiceCard
        service={service}
        isExpanded={true}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByText('Dla kogo')).toBeInTheDocument()
  })

  it('shows booking CTA only when expanded and tracks clicks separately', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    const { rerender } = render(
      <ExpandableServiceCard
        service={service}
        isExpanded={false}
        onToggle={onToggle}
      />,
    )

    expect(
      screen.queryByRole('link', { name: 'Umów się' }),
    ).not.toBeInTheDocument()

    rerender(
      <ExpandableServiceCard
        service={service}
        isExpanded
        onToggle={onToggle}
      />,
    )

    const ctaLink = screen.getByRole('link', { name: 'Umów się' })
    expect(ctaLink).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(ctaLink).toHaveAttribute('target', '_blank')
    expect(ctaLink).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(ctaLink)

    expect(onToggle).not.toHaveBeenCalled()
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'service-card',
      serviceId: service.id,
    })
  })
})
