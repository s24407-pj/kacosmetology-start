import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@data/services', () => {
  const services = [
    {
      id: 'service-classic-facial',
      name: 'Classic Facial',
      category: 'Kosmetologia',
      price: 150,
      duration: 60,
      isNext: false,
      description: 'Podstawowy zabieg',
    },
    {
      id: 'service-consultation-peel',
      name: 'Consultation Peel',
      category: 'Kosmetologia',
      price: 230,
      duration: 75,
      isNext: true,
      description: 'Wymaga konsultacji',
    },
    {
      id: 'service-classic-facial-premium',
      name: 'Classic Facial',
      category: 'Kosmetologia',
      price: 190,
      duration: 75,
      isNext: false,
      description: 'Rozszerzony zabieg',
    },
    {
      id: 'service-scalp-therapy',
      name: 'Scalp Therapy',
      category: 'Trychologia',
      price: 260,
      duration: 70,
      isNext: false,
      description: 'Terapia trychologiczna',
    },
  ]

  return {
    services,
    getServiceById: (serviceId: string) =>
      services.find((service) => service.id === serviceId),
  }
})

vi.mock('@data/promotion', async () => {
  const actual =
    await vi.importActual<typeof import('@data/promotion')>('@data/promotion')

  return {
    ...actual,
    getActivePromotion: vi.fn(),
    doesPromotionApplyToService: vi.fn(),
  }
})

const { navigate, routerState } = vi.hoisted(() => ({
  navigate: vi.fn().mockResolvedValue(undefined),
  routerState: { hash: '' },
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  useRouterState: () => routerState.hash,
}))

vi.mock('../components/ExpandableServiceCard', () => ({
  default: ({
    service,
    isExpanded,
    onToggle,
  }: {
    service: { id: string; name: string }
    isExpanded: boolean
    onToggle: () => void
  }) => (
    <button
      type="button"
      data-testid={`card-${service.id}`}
      data-expanded={isExpanded}
      onClick={onToggle}
    >
      {service.name}
    </button>
  ),
}))

import type { ActivePromotion } from '@data/promotion'
import {
  doesPromotionApplyToService,
  getActivePromotion,
} from '@data/promotion'
import ServicesSection from './ServicesSection'

describe('ServicesSection', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    routerState.hash = ''
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })

    vi.mocked(getActivePromotion).mockReturnValue(null)
    vi.mocked(doesPromotionApplyToService).mockImplementation(() => false)
  })

  it('consumes the legacy voucher hash through Router navigation', async () => {
    routerState.hash = 'services-vouchery'

    render(<ServicesSection />)

    expect(await screen.findByText('Vouchery prezentowe')).toBeInTheDocument()
    expect(navigate).toHaveBeenCalledWith({
      to: '/',
      hash: '',
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    })
  })

  it('filters services by category and toggles expansion', async () => {
    const user = userEvent.setup()

    render(<ServicesSection />)

    const standardCard = screen.getByTestId('card-service-classic-facial')
    const sameNameCard = screen.getByTestId(
      'card-service-classic-facial-premium',
    )
    const consultationCard = screen.getByTestId(
      'card-service-consultation-peel',
    )

    expect(standardCard).toHaveAttribute('data-expanded', 'false')
    expect(sameNameCard).toHaveAttribute('data-expanded', 'false')
    expect(consultationCard).toHaveAttribute('data-expanded', 'false')
    expect(
      screen.getByText('Kolejne zabiegi wymagają wcześniejszej konsultacji.'),
    ).toBeInTheDocument()

    await user.click(standardCard)
    expect(standardCard).toHaveAttribute('data-expanded', 'true')
    expect(sameNameCard).toHaveAttribute('data-expanded', 'false')

    await user.click(consultationCard)
    expect(standardCard).toHaveAttribute('data-expanded', 'false')
    expect(sameNameCard).toHaveAttribute('data-expanded', 'false')
    expect(consultationCard).toHaveAttribute(
      'data-expanded',
      'true',
    )
    expect(screen.getAllByText('Classic Facial')).toHaveLength(2)
    expect(screen.getByText('Consultation Peel')).toBeInTheDocument()
  })

  it('shows voucher panel when Vouchery category is selected', async () => {
    const user = userEvent.setup()

    render(<ServicesSection />)

    await user.click(screen.getByRole('button', { name: /Vouchery/ }))

    expect(screen.getByText('Vouchery prezentowe')).toBeInTheDocument()
    expect(
      screen.queryByTestId('card-service-classic-facial'),
    ).not.toBeInTheDocument()
  })

  it('shows empty state when promotion category has no active promotion', async () => {
    const user = userEvent.setup()

    render(<ServicesSection />)

    await user.click(screen.getByRole('button', { name: /Promocje/ }))

    expect(
      screen.getByText('Obecnie brak aktywnych promocji. Zajrzyj tu wkrótce!'),
    ).toBeInTheDocument()
  })

  it('displays promoted services and highlight when promotion is active', async () => {
    const user = userEvent.setup()

    const promotion: ActivePromotion = {
      id: 'test-promo',
      discountPercentage: 15,
      startDate: new Date('2025-01-01T00:00:00.000Z'),
      endDate: new Date('2025-12-31T23:59:59.999Z'),
      applicability: {
        type: 'services',
        serviceIds: ['service-classic-facial'],
      },
      ctaLabel: 'Zarezerwuj termin',
    }

    vi.mocked(getActivePromotion).mockReturnValue(promotion)
    vi.mocked(doesPromotionApplyToService).mockImplementation(
      (service) => service.id === 'service-classic-facial',
    )

    render(<ServicesSection />)

    await user.click(screen.getByRole('button', { name: /Promocje/ }))

    expect(screen.getByText('Aktualna promocja')).toBeInTheDocument()
    expect(
      screen.getByTestId('card-service-classic-facial'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('card-service-consultation-peel'),
    ).not.toBeInTheDocument()
  })
})
