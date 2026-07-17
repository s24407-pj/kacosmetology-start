import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@data/services', () => {
  const services = [
    {
      id: 'service-classic-facial',
      name: 'Classic Facial',
      catalogCategory: 'Kosmetologia',
      price: 150,
      duration: 60,
      isNext: false,
      description: 'Podstawowy zabieg',
    },
    {
      id: 'service-consultation-peel',
      name: 'Consultation Peel',
      catalogCategory: 'Kosmetologia',
      price: 230,
      duration: 75,
      isNext: true,
      description: 'Wymaga konsultacji',
    },
    {
      id: 'service-classic-facial-premium',
      name: 'Classic Facial',
      catalogCategory: 'Kosmetologia',
      price: 190,
      duration: 75,
      isNext: false,
      description: 'Rozszerzony zabieg',
    },
    {
      id: 'service-scalp-therapy',
      name: 'Scalp Therapy',
      catalogCategory: 'Trychologia',
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
    getAllActivePromotions: vi.fn(),
    resolveServicePromotion: vi.fn(actual.resolveServicePromotion),
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
import { getAllActivePromotions } from '@data/promotion'
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

    vi.mocked(getAllActivePromotions).mockReturnValue([])
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
    expect(consultationCard).toHaveAttribute('data-expanded', 'true')
    expect(screen.getAllByText('Classic Facial')).toHaveLength(2)
    expect(screen.getByText('Consultation Peel')).toBeInTheDocument()
  })

  it('preserves selector order, pressed state, and catalog filtering', async () => {
    const user = userEvent.setup()

    render(<ServicesSection />)

    const selector = screen.getByRole('group', {
      name: 'Kategorie zabiegów',
    })
    const buttons = Array.from(selector.querySelectorAll('button'))

    expect(buttons.map((button) => button.textContent)).toEqual([
      'Kosmetologia',
      'Trychologia',
      'Oprawa oka',
      'Online',
      'Vouchery',
      'Promocje',
    ])

    const cosmetologyButton = screen.getByRole('button', {
      name: 'Kosmetologia',
    })
    const trichologyButton = screen.getByRole('button', {
      name: 'Trychologia',
    })

    expect(cosmetologyButton).toHaveAttribute('aria-pressed', 'true')
    expect(trichologyButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(trichologyButton)

    expect(cosmetologyButton).toHaveAttribute('aria-pressed', 'false')
    expect(trichologyButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('card-service-scalp-therapy')).toBeInTheDocument()
    expect(
      screen.queryByTestId('card-service-classic-facial'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('card-service-consultation-peel'),
    ).not.toBeInTheDocument()
  })

  it('shows voucher panel when the Vouchery view is selected', async () => {
    const user = userEvent.setup()

    render(<ServicesSection />)

    await user.click(screen.getByRole('button', { name: /Vouchery/ }))

    expect(screen.getByText('Vouchery prezentowe')).toBeInTheDocument()
    expect(
      screen.queryByTestId('card-service-classic-facial'),
    ).not.toBeInTheDocument()
  })

  it('shows empty state when the promotion view has no active promotion', async () => {
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
      id: 'october-2025-oczyszczanie-wodorowe',
      discountPercentage: 20,
      startDate: new Date('2025-10-01T00:00:00.000Z'),
      endDate: new Date('2025-10-31T23:59:59.999Z'),
      applicability: {
        type: 'services',
        serviceIds: ['service-classic-facial'],
        description: 'oczyszczanie wodorowe – z 250 zł na 200 zł',
      },
      ctaLabel: 'Zarezerwuj termin',
    }

    vi.mocked(getAllActivePromotions).mockReturnValue([promotion])

    render(<ServicesSection />)

    await user.click(screen.getByRole('button', { name: /Promocje/ }))

    expect(screen.getAllByText('Aktualna promocja')).toHaveLength(1)
    expect(
      screen.getByText(
        /-20% na oczyszczanie wodorowe – z 250 zł na 200 zł przez cały październik/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('card-service-classic-facial'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('card-service-consultation-peel'),
    ).not.toBeInTheDocument()
  })

  it('presents every campaign and a de-duplicated union in either active order', async () => {
    const user = userEvent.setup()
    const strongerPromotion: ActivePromotion = {
      id: 'synthetic-stronger',
      discountPercentage: 20,
      startDate: new Date('2025-10-05T00:00:00.000Z'),
      endDate: new Date('2025-10-31T23:59:59.999Z'),
      applicability: {
        type: 'services',
        serviceIds: ['service-classic-facial'],
        description: 'zabieg klasyczny',
      },
      ctaLabel: 'Zarezerwuj termin',
    }
    const broaderPromotion: ActivePromotion = {
      id: 'synthetic-broader',
      discountPercentage: 15,
      startDate: new Date('2025-10-01T00:00:00.000Z'),
      endDate: new Date('2025-10-31T23:59:59.999Z'),
      applicability: {
        type: 'services',
        serviceIds: ['service-classic-facial', 'service-consultation-peel'],
        description: 'zabiegi konsultacyjne',
      },
      ctaLabel: 'Zarezerwuj termin',
    }
    const activePromotions = [strongerPromotion, broaderPromotion]

    vi.mocked(getAllActivePromotions).mockReturnValue(activePromotions)

    const view = render(<ServicesSection />)
    await user.click(screen.getByRole('button', { name: /Promocje/ }))

    expect(screen.getAllByText('Aktualna promocja')).toHaveLength(2)
    expect(screen.getByText(/-20% na zabieg klasyczny/)).toBeInTheDocument()
    expect(
      screen.getByText(/-15% na zabiegi konsultacyjne/),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('card-service-classic-facial')).toHaveLength(1)
    expect(
      screen.getByTestId('card-service-consultation-peel'),
    ).toBeInTheDocument()

    vi.mocked(getAllActivePromotions).mockReturnValue(
      [...activePromotions].reverse(),
    )
    view.rerender(<ServicesSection />)

    expect(screen.getAllByText('Aktualna promocja')).toHaveLength(2)
    expect(screen.getAllByTestId('card-service-classic-facial')).toHaveLength(1)
    expect(
      screen.getByTestId('card-service-consultation-peel'),
    ).toBeInTheDocument()
  })
})
