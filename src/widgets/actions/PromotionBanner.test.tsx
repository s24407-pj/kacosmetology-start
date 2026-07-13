import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { RenderResult } from '@testing-library/react'
import { cleanup, render, waitFor } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import userEvent from '@testing-library/user-event'

vi.mock('@data/promotion', () => ({
  getActivePromotion: vi.fn(),
  formatPromotionDeadline: vi.fn(),
  getPromotionScopeDescription: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import type { ActivePromotion } from '@data/promotion'
import {
  formatPromotionDeadline,
  getActivePromotion,
  getPromotionScopeDescription,
} from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import PromotionBanner from './PromotionBanner'

const getActivePromotionMock = vi.mocked(getActivePromotion)
const formatPromotionDeadlineMock = vi.mocked(formatPromotionDeadline)
const getPromotionScopeDescriptionMock = vi.mocked(getPromotionScopeDescription)
const trackPlausibleEventMock = vi.mocked(trackPlausibleEvent)

const createPromotion = (): ActivePromotion => ({
  id: 'test-promo',
  discountPercentage: 20,
  startDate: new Date('2025-09-01T00:00:00.000Z'),
  endDate: new Date('2025-09-30T23:59:59.999Z'),
  applicability: {
    type: 'all',
    description: 'wszystkie zabiegi',
  },
  ctaLabel: 'Zarezerwuj teraz',
})

describe('PromotionBanner', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    getActivePromotionMock.mockReset()
    formatPromotionDeadlineMock.mockReset()
    getPromotionScopeDescriptionMock.mockReset()
    trackPlausibleEventMock.mockReset()
  })

  it('does not render when there is no active promotion', () => {
    getActivePromotionMock.mockReturnValue(null)

    const view: RenderResult = render(<PromotionBanner />)

    expect(view.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders promotion details when a promotion is active', () => {
    const promotion = createPromotion()
    getActivePromotionMock.mockReturnValue(promotion)
    getPromotionScopeDescriptionMock.mockReturnValue('całe spa')
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view: RenderResult = render(<PromotionBanner />)

    expect(view.getByRole('status')).toBeInTheDocument()
    expect(
      view.getByText('Promocja! - całe spa tylko dziś.'),
    ).toBeInTheDocument()

    const ctaLink = view.getByRole('link', { name: 'Zarezerwuj teraz' })
    expect(ctaLink).toHaveAttribute('href', 'https://kacosmetology.booksy.com')
  })

  it('tracks CTA clicks', async () => {
    const promotion = createPromotion()
    getActivePromotionMock.mockReturnValue(promotion)
    getPromotionScopeDescriptionMock.mockReturnValue('całe spa')
    formatPromotionDeadlineMock.mockReturnValue('tylko dziś')

    const view: RenderResult = render(<PromotionBanner />)

    const user: UserEvent = userEvent.setup()
    await user.click(view.getByRole('link', { name: 'Zarezerwuj teraz' }))

    expect(trackPlausibleEventMock).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'promotion-banner',
      promotionId: promotion.id,
    })
  })

  it('dismisses the banner without persisting state', async () => {
    const promotion = createPromotion()
    getActivePromotionMock.mockReturnValue(promotion)
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
})
