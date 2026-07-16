import type { ServiceCatalogCategory, ServiceId } from '@app-types/types'
import HairsBulbSVG from '@components/icons/HairsBulbSVG'
import {
  Alert,
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
import { ServiceViewButton } from '../components/ServiceViewButton'

type ServiceView = ServiceCatalogCategory | 'Vouchery' | 'Promocje'

const serviceViewOptions: Array<{
  id: ServiceView
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
  const [activeView, setActiveView] = useState<ServiceView>('Kosmetologia')
  const [expandedCard, setExpandedCard] = useState<ServiceId | null>(null)

  useEffect(() => {
    if (hash !== 'services-vouchery') {
      return
    }

    setActiveView('Vouchery')
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

  const handleViewChange = (view: ServiceView) => {
    setActiveView(view)
  }

  const handleCardToggle = (serviceId: ServiceId) => {
    setExpandedCard(expandedCard === serviceId ? null : serviceId)
  }

  const isVoucherView = activeView === 'Vouchery'
  const isPromotionView = activeView === 'Promocje'
  const visibleServices = isVoucherView
    ? []
    : isPromotionView
      ? promotedServices
      : services.filter(
          (service) =>
            service.catalogCategory.toLowerCase() === activeView.toLowerCase(),
        )
  const standardServices = isVoucherView
    ? []
    : visibleServices.filter((service) => !service.isNext)
  const consultationRequiredServices = isVoucherView
    ? []
    : visibleServices.filter((service) => service.isNext)
  const noPromotionsAvailable =
    isPromotionView && (!promotion || visibleServices.length === 0)

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

      {/* Opcje widoku */}
      <div className="mb-10 flex justify-center animate-on-scroll">
        <div
          role="group"
          aria-label="Kategorie zabiegów"
          className="flex flex-wrap justify-center gap-2"
        >
          {serviceViewOptions.map((viewOption) => (
            <ServiceViewButton
              key={viewOption.id}
              active={activeView === viewOption.id}
              onClick={() => handleViewChange(viewOption.id)}
              icon={viewOption.icon}
              label={viewOption.label}
            />
          ))}
        </div>
      </div>

      {/* Wyświetlane zabiegi */}
      <div
        id="services-grid"
        className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {isVoucherView ? (
          <VoucherCard />
        ) : noPromotionsAvailable ? (
          <div className="animate-on-scroll animate-fade-up md:col-span-2 lg:col-span-3">
            <Alert variant="info">
              Obecnie brak aktywnych promocji. Zajrzyj tu wkrótce!
            </Alert>
          </div>
        ) : (
          <>
            {isPromotionView && promotion && (
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
                  expandedCard === service.id && 'lg:col-span-2 xl:col-span-2',
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
                key={`consultation-notice-${activeView}`}
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
                  expandedCard === service.id && 'lg:col-span-2 xl:col-span-2',
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
