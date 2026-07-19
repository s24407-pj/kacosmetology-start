import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { RenderResult } from '@testing-library/react'
import { cleanup, render, waitFor } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import userEvent from '@testing-library/user-event'

vi.mock('@data/promotion', () => ({
  getAllActivePromotions: vi.fn(),
  formatPromotionDeadline: vi.fn(),
  getPromotionScopeDescription: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { primarySalonLocation } from '@data/business'
import type { ActivePromotion } from '@data/promotion'
import {
  formatPromotionDeadline,
  getAllActivePromotions,
  getPromotionScopeDescription,
} from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import { clickAnalyticsLink } from '@/test/clickAnalyticsLink'
import PromotionBanner from './PromotionBanner'

const getAllActivePromotionsMock = vi.mocked(getAllActivePromotions)
const formatPromotionDeadlineMock = vi.mocked(formatPromotionDeadline)
const getPromotionScopeDescriptionMock = vi.mocked(getPromotionScopeDescription)
const trackPlausibleEventMock = vi.mocked(trackPlausibleEvent)

const createPromotion = (
  overrides: Partial<ActivePromotion> = {},
): ActivePromotion => ({
  id: 'september-2025-all-services',
  discountPercentage: 20,
  startDate: new Date('2025-09-01T00:00:00.000Z'),
  endDate: new Date('2025-09-30T23:59:59.999Z'),
  applicability: {
    type: 'all',
    description: 'wszystkie zabiegi',
  },
  ctaLabel: 'Zarezerwuj termin',
  ...overrides,
})

describe('PromotionBanner', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    getAllActivePromotionsMock.mockReset()
    formatPromotionDeadlineMock.mockReset()
    getPromotionScopeDescriptionMock.mockReset()
    trackPlausibleEventMock.mockReset()
  })

  it('does not render when there is no active promotion', () => {
    getAllActivePromotionsMock.mockReturnValue([])

    const view: RenderResult = render(<PromotionBanner />)

    expect(view.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders promotion details when a promotion is active', () => {
    const promotion = createPromotion()
    getAllActivePromotionsMock.mockReturnValue([promotion])
    getPromotionScopeDescriptionMock.mockReturnValue('całe spa')
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view: RenderResult = render(<PromotionBanner />)

    expect(view.getByRole('status')).toBeInTheDocument()
    expect(
      view.getByText('Promocja! - całe spa tylko dziś.'),
    ).toBeInTheDocument()

    const ctaLink = view.getByRole('link', { name: /Zarezerwuj termin/ })
    expect(ctaLink).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(ctaLink).toHaveAttribute('target', '_blank')
  })

  it('tracks CTA clicks', async () => {
    const promotion = createPromotion()
    getAllActivePromotionsMock.mockReturnValue([promotion])
    getPromotionScopeDescriptionMock.mockReturnValue('całe spa')
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view: RenderResult = render(<PromotionBanner />)

    const user: UserEvent = userEvent.setup()
    await clickAnalyticsLink(
      user,
      view.getByRole('link', { name: /Zarezerwuj termin/ }),
    )

    expect(trackPlausibleEventMock).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'promotion-banner',
      promotionId: promotion.id,
    })
  })

  it('dismisses the banner without persisting state', async () => {
    const promotion = createPromotion()
    getAllActivePromotionsMock.mockReturnValue([promotion])
    getPromotionScopeDescriptionMock.mockReturnValue('całe spa')
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view: RenderResult = render(<PromotionBanner />)

    const user: UserEvent = userEvent.setup()
    await user.click(
      view.getByRole('button', { name: 'Zamknij baner promocji' }),
    )

    expect(trackPlausibleEventMock).toHaveBeenCalledWith(
      'Promotion Banner Dismissed',
      {
        placement: 'promotion-banner',
        promotionId: promotion.id,
      },
    )
    await waitFor(() => {
      expect(view.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('renders every message and tracks each campaign CTA independently', async () => {
    const firstPromotion = createPromotion({
      id: 'synthetic-first',
      ctaLabel: 'Zarezerwuj pierwszy',
    })
    const secondPromotion = createPromotion({
      id: 'synthetic-second',
      ctaLabel: 'Zarezerwuj drugi',
    })
    getAllActivePromotionsMock.mockReturnValue([
      firstPromotion,
      secondPromotion,
    ])
    getPromotionScopeDescriptionMock.mockImplementation(
      (promotion) => `zakres ${promotion.id}`,
    )
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view = render(<PromotionBanner />)

    expect(view.getAllByRole('status')).toHaveLength(1)
    expect(
      view.getByText('Promocja! - zakres synthetic-first tylko dziś.'),
    ).toBeInTheDocument()
    expect(
      view.getByText('Promocja! - zakres synthetic-second tylko dziś.'),
    ).toBeInTheDocument()

    const user = userEvent.setup()
    await clickAnalyticsLink(
      user,
      view.getByRole('link', { name: /Zarezerwuj pierwszy/ }),
    )
    await clickAnalyticsLink(
      user,
      view.getByRole('link', { name: /Zarezerwuj drugi/ }),
    )

    expect(trackPlausibleEventMock).toHaveBeenNthCalledWith(
      1,
      'CTA Booksy Click',
      {
        placement: 'promotion-banner',
        promotionId: firstPromotion.id,
      },
    )
    expect(trackPlausibleEventMock).toHaveBeenNthCalledWith(
      2,
      'CTA Booksy Click',
      {
        placement: 'promotion-banner',
        promotionId: secondPromotion.id,
      },
    )
  })

  it('dismisses the combined banner once and tracks every campaign', async () => {
    const promotions = [
      createPromotion({ id: 'synthetic-first' }),
      createPromotion({ id: 'synthetic-second' }),
    ]
    getAllActivePromotionsMock.mockReturnValue(promotions)
    getPromotionScopeDescriptionMock.mockReturnValue('całe spa')
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view = render(<PromotionBanner />)
    const user = userEvent.setup()
    await user.click(
      view.getByRole('button', { name: 'Zamknij baner promocji' }),
    )

    expect(trackPlausibleEventMock).toHaveBeenCalledTimes(2)
    for (const promotion of promotions) {
      expect(trackPlausibleEventMock).toHaveBeenCalledWith(
        'Promotion Banner Dismissed',
        {
          placement: 'promotion-banner',
          promotionId: promotion.id,
        },
      )
    }
    await waitFor(() => {
      expect(view.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})
