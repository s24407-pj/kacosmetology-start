import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@data/promotion', () => ({
  getActivePromotion: vi.fn(),
  doesPromotionApplyToService: vi.fn(),
  getReferenceDate: vi.fn(() => new Date('2025-09-15T12:00:00.000Z')),
}))

vi.mock('@libs/priceHistory', () => ({
  syncCurrentPriceWithHistory: vi.fn(),
  getLowestPriceInLastDays: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@context/RenderTimeProvider', () => ({
  useRenderTime: () => new Date('2025-09-15T12:00:00.000Z'),
}))

const promotionModule = await import('@data/promotion')
const priceHistoryModule = await import('@libs/priceHistory')

const getActivePromotionMock = vi.mocked(promotionModule.getActivePromotion)
const doesPromotionApplyToServiceMock = vi.mocked(
  promotionModule.doesPromotionApplyToService,
)
const syncCurrentPriceWithHistoryMock = vi.mocked(
  priceHistoryModule.syncCurrentPriceWithHistory,
)
const getLowestPriceInLastDaysMock = vi.mocked(
  priceHistoryModule.getLowestPriceInLastDays,
)

import type { Service } from '@app-types/types'
import { contact } from '@data/contact'
import type { PromotionApplicability } from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import ExpandableServiceCard from './ExpandableServiceCard'

describe('ExpandableServiceCard', () => {
  const service: Service = {
    id: 'service-test-service',
    name: 'Test Service',
    category: 'Kosmetologia',
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
  })

  it('renders discounted pricing details when a promotion applies', () => {
    const promotion = {
      id: 'promo-1',
      discountPercentage: 20,
      startDate: new Date('2025-09-01T00:00:00.000Z'),
      endDate: new Date('2025-09-30T23:59:59.999Z'),
      applicability: {
        type: 'all',
        description: 'wszystkie zabiegi',
      } as PromotionApplicability,
      ctaLabel: 'Zarezerwuj',
    }

    getActivePromotionMock.mockReturnValue(promotion)
    doesPromotionApplyToServiceMock.mockReturnValue(true)
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

    expect(syncCurrentPriceWithHistoryMock).toHaveBeenCalledWith(
      'service-test-service',
      200,
      expect.any(Date),
    )
    const changedAt = syncCurrentPriceWithHistoryMock.mock.calls[0]?.[2] as Date
    expect(changedAt).toEqual(new Date('2025-09-01T00:00:00.000Z'))
    expect(getLowestPriceInLastDaysMock).toHaveBeenCalledWith(
      'service-test-service',
      30,
      new Date('2025-09-01T00:00:00.000Z'),
    )
  })

  it('supports toggling via mouse and keyboard interactions', async () => {
    getActivePromotionMock.mockReturnValue(null)
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
    expect(detailsId).toBeTruthy()
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
    getActivePromotionMock.mockReturnValue(null)

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

    getActivePromotionMock.mockReturnValue(null)

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
    expect(ctaLink).toHaveAttribute('href', contact.booksy)
    expect(ctaLink).toHaveAttribute('target', '_blank')
    expect(ctaLink).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(ctaLink)

    expect(onToggle).not.toHaveBeenCalled()
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'service-card',
      service: service.name,
    })
  })
})
