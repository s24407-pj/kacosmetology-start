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
  analytics: {
    trackInitiateCheckout: vi.fn(),
    trackLead: vi.fn(),
  },
}))

import { primarySalonLocation } from '@data/business'
import type { ActivePromotion } from '@data/promotion'
import {
  formatPromotionDeadline,
  getAllActivePromotions,
  getPromotionScopeDescription,
} from '@data/promotion'
import { analytics } from '@libs/analytics'
import { clickAnalyticsLink } from '@/test/clickAnalyticsLink'
import PromotionBanner from './PromotionBanner'

const getAllActivePromotionsMock = vi.mocked(getAllActivePromotions)
const formatPromotionDeadlineMock = vi.mocked(formatPromotionDeadline)
const getPromotionScopeDescriptionMock = vi.mocked(getPromotionScopeDescription)
const trackInitiateCheckoutMock = vi.mocked(analytics.trackInitiateCheckout)

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
  ...overrides,
})

describe('PromotionBanner', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    getAllActivePromotionsMock.mockReset()
    formatPromotionDeadlineMock.mockReset()
    getPromotionScopeDescriptionMock.mockReset()
    trackInitiateCheckoutMock.mockReset()

    class PassthroughResizeObserver {
      callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      observe() {}

      unobserve() {}

      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', PassthroughResizeObserver)
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

    const ctaLink = view.getByRole('link', {
      name: 'Zarezerwuj termin w Booksy (otwiera nową kartę)',
    })
    expect(ctaLink).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(ctaLink).toHaveAttribute('target', '_blank')
    expect(ctaLink).toHaveTextContent('Zarezerwuj')
    expect(ctaLink).toHaveTextContent('Zarezerwuj termin')
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
      view.getByRole('link', {
        name: 'Zarezerwuj termin w Booksy (otwiera nową kartę)',
      }),
    )

    expect(trackInitiateCheckoutMock).toHaveBeenCalledWith({
      placement: 'promotion-banner',
      destinationUrl: primarySalonLocation.bookingUrl,
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

    expect(trackInitiateCheckoutMock).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(view.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('renders every message and tracks each campaign CTA independently', async () => {
    const firstPromotion = createPromotion({
      id: 'synthetic-first',
    })
    const secondPromotion = createPromotion({
      id: 'synthetic-second',
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
    const ctaLinks = view.getAllByRole('link', {
      name: 'Zarezerwuj termin w Booksy (otwiera nową kartę)',
    })
    expect(ctaLinks).toHaveLength(2)
    await clickAnalyticsLink(user, ctaLinks[0])
    await clickAnalyticsLink(user, ctaLinks[1])

    expect(trackInitiateCheckoutMock).toHaveBeenNthCalledWith(1, {
      placement: 'promotion-banner',
      destinationUrl: primarySalonLocation.bookingUrl,
    })
    expect(trackInitiateCheckoutMock).toHaveBeenNthCalledWith(2, {
      placement: 'promotion-banner',
      destinationUrl: primarySalonLocation.bookingUrl,
    })
  })

  it('dismisses the combined banner once', async () => {
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

    expect(trackInitiateCheckoutMock).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(view.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('enables the marquee track when the promotion message overflows', async () => {
    const promotion = createPromotion()
    getAllActivePromotionsMock.mockReturnValue([promotion])
    getPromotionScopeDescriptionMock.mockReturnValue(
      'bardzo długa promocja na wiele zabiegów kosmetologicznych',
    )
    formatPromotionDeadlineMock.mockReturnValue('tylko do końca miesiąca')

    class OverflowResizeObserver {
      callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        const isViewport =
          target instanceof HTMLElement &&
          target.classList.contains('overflow-hidden')
        Object.defineProperty(target, 'scrollWidth', {
          configurable: true,
          get: () => (isViewport ? 120 : 400),
        })
        Object.defineProperty(target, 'clientWidth', {
          configurable: true,
          get: () => (isViewport ? 120 : 400),
        })
        this.callback([], this)
      }

      unobserve() {}

      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', OverflowResizeObserver)

    const view = render(<PromotionBanner />)

    await waitFor(() => {
      expect(
        view.container.querySelector('.animate-promotion-banner-marquee'),
      ).toBeInTheDocument()
    })
  })
})
