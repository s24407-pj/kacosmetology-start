import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@hooks/useSectionNavigation', () => ({
  useSectionNavigation: () => vi.fn(),
}))

import type { ActivePromotion } from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import { PromotionBannerCard, VoucherCard } from './ServiceCards'

describe('ServiceCards', () => {
  it('renders voucher card and tracks CTA click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<VoucherCard onCTAClick={onClick} />)

    expect(
      screen.getByRole('heading', { name: 'Vouchery prezentowe' }),
    ).toBeVisible()

    const cta = screen.getByRole('link', { name: 'Zapytaj o voucher' })
    expect(cta).toHaveAttribute('href', '#kontakt')

    await user.click(cta)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Voucher CTA Click', {
      placement: 'services-section',
    })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders promotion banner content', () => {
    const promotion: ActivePromotion = {
      id: 'october-2025-oczyszczanie-wodorowe',
      discountPercentage: 20,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      applicability: {
        type: 'services',
        serviceNames: ['Oczyszczanie wodorowe'],
        description: 'oczyszczanie wodorowe – z 250 zł na 200 zł',
      },
      ctaLabel: 'Zarezerwuj termin',
    }

    render(
      <PromotionBannerCard
        promotion={promotion}
        scopeDescription="oczyszczanie wodorowe"
        deadline="do 31 października"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Aktualna promocja' }),
    ).toBeVisible()
    expect(screen.getByText(/-20%/)).toBeVisible()
    expect(screen.getByText(/oczyszczanie wodorowe/)).toBeVisible()
    expect(screen.getByText(/do 31 października/)).toBeVisible()
  })
})
