import type { ServiceCategory, ServiceId } from '@app-types/types'
import HairsBulbSVG from '@components/icons/HairsBulbSVG'
import {
  Alert,
  CategoryButton,
  PromotionBannerCard,
  Section,
  SectionHeader,
  VoucherCard,
} from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import {
  doesPromotionApplyToService,
  formatPromotionDeadline,
  getActivePromotion,
  getPromotionScopeDescription,
} from '@data/promotion'
import { services } from '@data/services'
import { cn } from '@libs/utils'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Eye, Gift, Monitor, Percent, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import ExpandableServiceCard from '../components/ExpandableServiceCard'

const categories: Array<{
  id: ServiceCategory
  label: string
  icon: React.ReactNode
}> = [
  {
    id: 'Kosmetologia',
    label: 'Kosmetologia',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: 'Trychologia',
    label: 'Trychologia',
    icon: <HairsBulbSVG />,
  },
  { id: 'Oprawa oka', label: 'Oprawa oka', icon: <Eye className="w-5 h-5" /> },
  { id: 'Online', label: 'Online', icon: <Monitor className="w-5 h-5" /> },
  { id: 'Vouchery', label: 'Vouchery', icon: <Gift className="w-5 h-5" /> },
  {
    id: 'Promocje',
    label: 'Promocje',
    icon: <Percent className="w-5 h-5" />,
  },
]

export default function ServicesSection() {
  const renderTime = useRenderTime()
  const navigate = useNavigate({ from: '/' })
  const hash = useRouterState({ select: (state) => state.location.hash })
  const [activeCategory, setActiveCategory] =
    useState<ServiceCategory>('Kosmetologia')
  const [expandedCard, setExpandedCard] = useState<ServiceId | null>(null)

  useEffect(() => {
    if (hash !== 'services-vouchery') {
      return
    }

    setActiveCategory('Vouchery')
    void navigate({
      to: '/',
      hash: '',
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    }).then(() => {
      document
        .getElementById('zabiegi')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [hash, navigate])

  const promotion = getActivePromotion(renderTime)
  const promotedServices = promotion
    ? services.filter((service) =>
        doesPromotionApplyToService(service, promotion),
      )
    : []

  const handleCategoryChange = (category: ServiceCategory) => {
    setActiveCategory(category)
  }

  const handleCardToggle = (serviceId: ServiceId) => {
    setExpandedCard(expandedCard === serviceId ? null : serviceId)
  }

  const isVoucherCategory = activeCategory === 'Vouchery'
  const isPromotionCategory = activeCategory === 'Promocje'
  const filteredServices = isVoucherCategory
    ? []
    : isPromotionCategory
      ? promotedServices
      : services.filter(
          (service) =>
            service.category.toLowerCase() === activeCategory.toLowerCase(),
        )
  const standardServices = isVoucherCategory
    ? []
    : filteredServices.filter((service) => !service.isNext)
  const consultationRequiredServices = isVoucherCategory
    ? []
    : filteredServices.filter((service) => service.isNext)
  const noPromotionsAvailable =
    isPromotionCategory && (!promotion || filteredServices.length === 0)

  return (
    <Section id="zabiegi" background="white">
      <SectionHeader
        title="Zabiegi"
        eyebrow="Oferta gabinetu"
        subtitle="Zadbaj o siebie kompleksowo. Sprawdź ofertę zabiegów – dopasowaną do
            Twoich indywidualnych potrzeb. Kliknij w kartę, aby zobaczyć
            szczegóły."
        gradient
      />

      {/* Kategorie przyciski */}
      <div className="mb-10 flex justify-center animate-on-scroll">
        <div
          role="group"
          aria-label="Kategorie zabiegów"
          className="flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <CategoryButton
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              icon={cat.icon}
              label={cat.label}
            />
          ))}
        </div>
      </div>

      {/* Wyświetlane zabiegi */}
      <div
        id="services-grid"
        className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {isVoucherCategory ? (
          <VoucherCard />
        ) : noPromotionsAvailable ? (
          <div className="animate-on-scroll animate-fade-up md:col-span-2 lg:col-span-3">
            <Alert variant="info">
              Obecnie brak aktywnych promocji. Zajrzyj tu wkrótce!
            </Alert>
          </div>
        ) : (
          <>
            {isPromotionCategory && promotion && (
              <PromotionBannerCard
                promotion={promotion}
                scopeDescription={getPromotionScopeDescription(promotion)}
                deadline={formatPromotionDeadline(promotion)}
              />
            )}
            {standardServices.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  `animate-on-scroll stagger-${Math.min(index + 1, 6)} animate-fade-up`,
                  expandedCard === service.id &&
                    'lg:col-span-2 xl:col-span-2',
                )}
              >
                <ExpandableServiceCard
                  service={service}
                  isExpanded={expandedCard === service.id}
                  onToggle={() => handleCardToggle(service.id)}
                />
              </div>
            ))}
            {consultationRequiredServices.length > 0 && (
              <div
                key={`consultation-notice-${activeCategory}`}
                className="animate-on-scroll animate-fade-up md:col-span-2 lg:col-span-3"
              >
                <Alert variant="warning">
                  Kolejne zabiegi wymagają wcześniejszej konsultacji.
                </Alert>
              </div>
            )}
            {consultationRequiredServices.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  `animate-on-scroll stagger-${Math.min(index + 1, 6)} animate-fade-up`,
                  expandedCard === service.id &&
                    'lg:col-span-2 xl:col-span-2',
                )}
              >
                <ExpandableServiceCard
                  service={service}
                  isExpanded={expandedCard === service.id}
                  onToggle={() => handleCardToggle(service.id)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </Section>
  )
}
