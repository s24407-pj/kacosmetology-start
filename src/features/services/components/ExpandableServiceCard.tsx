import type { Service } from '@app-types/types'
import { Alert, BulletListItem } from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { contact } from '@data/contact'
import {
  doesPromotionApplyToService,
  getActivePromotion,
} from '@data/promotion'
import { getServicePriceHistory } from '@data/servicePriceHistory'
import { trackPlausibleEvent } from '@libs/analytics'
import { getLowestPriceInLastDays } from '@libs/priceHistory'
import { cn, formatDuration, formatPrice } from '@libs/utils'
import { Calendar, ChevronDown, ChevronUp, Clock, User } from 'lucide-react'
import { useMemo } from 'react'

export default function ExpandableServiceCard({
  service,
  isExpanded,
  onToggle,
}: {
  service: Service
  isExpanded: boolean
  onToggle: () => void
}) {
  const referenceDate = useRenderTime()
  const promotion = getActivePromotion(referenceDate)

  const discountedPrice = useMemo(() => {
    const discount =
      promotion && doesPromotionApplyToService(service, promotion)
        ? promotion.discountPercentage
        : null

    if (discount === null) {
      return null
    }

    return Number((service.price * (1 - discount / 100)).toFixed(0))
  }, [service, promotion])

  const applicableDiscountPercentage = useMemo(() => {
    return promotion && doesPromotionApplyToService(service, promotion)
      ? promotion.discountPercentage
      : null
  }, [service, promotion])

  const servicePriceHistory = useMemo(
    () => getServicePriceHistory(service.id),
    [service.id],
  )

  // Dyrektywa Omnibus (UE) wymaga pokazania najniższej ceny z ostatnich 30 dni
  // przed obniżką. Jeśli promocja zaczęła się mniej niż 30 dni temu, okno
  // czasowe liczymy od startu promocji (nie od dziś), żeby uwzględnić ceny
  // sprzed promocji. Dzięki temu "najniższa cena 30 dni" jest ceną bazową,
  // a nie samą ceną promocyjną.
  const lowestPrice = useMemo(() => {
    const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000
    let nowForLowestPrice = referenceDate

    if (promotion && discountedPrice) {
      const promotionAge =
        referenceDate.getTime() - promotion.startDate.getTime()
      if (promotionAge < THIRTY_DAYS_IN_MS) {
        nowForLowestPrice = promotion.startDate
      }
    }

    const value = getLowestPriceInLastDays(
      servicePriceHistory,
      30,
      nowForLowestPrice,
    )

    return typeof value === 'number' ? value : null
  }, [servicePriceHistory, referenceDate, promotion, discountedPrice])
  const showLowestPrice = lowestPrice !== null
  const detailsId = `details-${service.id}`

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border-default bg-surface shadow-subtle transition-colors duration-200 hover:border-action/40',
        isExpanded && 'ring-1 ring-action/20',
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-action transition-opacity duration-200',
          isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />
      <div className="p-5 sm:p-6">
        {/* Nagłówek */}
        <button
          type="button"
          onClick={onToggle}
          className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary group-hover:text-action transition-colors duration-200 wrap-break-word font-body">
                  {service.name}
                </h3>
              </div>
              {service.description && (
                <p className="mt-2 text-sm text-text-secondary leading-snug line-clamp-3">
                  {service.description}
                </p>
              )}
              {service.forWho && !isExpanded && (
                <p className="hidden pt-2 text-xs italic leading-snug text-text-muted md:block">
                  {service.forWho.length > 150
                    ? `${service.forWho.slice(0, 150)}…`
                    : service.forWho}
                </p>
              )}
            </div>

            <div className="text-right min-w-fit">
              {discountedPrice ? (
                <div className="flex flex-col items-end">
                  <span className="mb-1 inline-flex items-center rounded-md bg-action px-2.5 py-0.5 text-sm font-bold text-white">
                    -{applicableDiscountPercentage?.toFixed(0)}%
                  </span>
                  <span className="text-sm text-text-muted line-through whitespace-nowrap">
                    {formatPrice(service.price)}
                  </span>
                  <span className="text-md sm:text-lg font-bold text-action whitespace-nowrap">
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
              ) : (
                <div className="text-md sm:text-lg font-bold text-action whitespace-nowrap">
                  {formatPrice(service.price)}
                </div>
              )}
              {showLowestPrice && discountedPrice && (
                <div className="text-xs text-text-muted whitespace-nowrap mt-1">
                  Najniższa cena (30 dni): {formatPrice(lowestPrice)}
                </div>
              )}
              <div className="mt-1.5 inline-flex items-center gap-1 self-end whitespace-nowrap rounded-md bg-surface-muted px-2.5 py-1 text-xs font-medium text-action">
                <Clock className="h-3 w-3" />
                {formatDuration(service.duration)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center border-t border-border-default pt-2">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </div>
        </button>

        {/* Sekcja rozwinięta */}
        {isExpanded && (
          <div
            id={detailsId}
            className="mt-6 space-y-6 animate-in slide-in-from-top duration-300 animate-fade-up"
          >
            {/* Opis pełny */}
            {service.description && (
              <div>
                <h4 className="font-semibold text-text-primary mb-2">
                  Opis zabiegu
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}

            {/* Dla kogo */}
            {service.forWho && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-action" />
                  <h4 className="font-semibold text-text-primary">Dla kogo</h4>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  {service.forWho}
                </p>
              </div>
            )}

            {/* Notatka */}
            {service.note && (
              <Alert variant="warning">
                <strong>Uwaga:</strong> {service.note}
              </Alert>
            )}

            {/* Przygotowanie */}
            {service.preparation && service.preparation.length > 0 && (
              <div>
                <h4 className="font-semibold text-text-primary mb-3">
                  Przygotowanie do wizyty
                </h4>
                <ul className="space-y-2">
                  {service.preparation.map((item: string) => (
                    <BulletListItem key={item} color="primary">
                      {item}
                    </BulletListItem>
                  ))}
                </ul>
              </div>
            )}

            {/* Efekty */}
            {service.effects && service.effects.length > 0 && (
              <div>
                <h4 className="font-semibold text-text-primary mb-3">
                  Efekty zabiegu
                </h4>
                <ul className="space-y-2">
                  {service.effects.map((effect: string) => (
                    <BulletListItem key={effect} color="green">
                      {effect}
                    </BulletListItem>
                  ))}
                </ul>
              </div>
            )}

            {/* Co obejmuje */}
            {service.includes && service.includes.length > 0 && (
              <div>
                <h4 className="font-semibold text-text-primary mb-3">
                  Co obejmuje
                </h4>
                <ul className="space-y-2">
                  {service.includes.map((item: string) => (
                    <BulletListItem key={item} color="blue">
                      {item}
                    </BulletListItem>
                  ))}
                </ul>
              </div>
            )}

            {/* Zalecane badania */}
            {service.recommendedTests &&
              service.recommendedTests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">
                    Zalecane badania
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {service.recommendedTests.map((test: string) => (
                      <span
                        key={test}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Przeciwwskazania */}
            {service.contraindications && (
              <Alert variant="error">
                <h4 className="font-semibold mb-2">Przeciwwskazania</h4>
                {typeof service.contraindications === 'string' ? (
                  <p>{service.contraindications}</p>
                ) : (
                  <ul className="space-y-1 mt-2">
                    {service.contraindications.map((item: string) => (
                      <BulletListItem
                        key={item}
                        color="red"
                        className="text-red-800"
                      >
                        {item}
                      </BulletListItem>
                    ))}
                  </ul>
                )}
              </Alert>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-sm text-text-muted">
                Gotowa na wizytę? Zarezerwuj dogodny termin przez Booksy.
              </div>
              <a
                href={contact.booksy}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  event.stopPropagation()
                  trackPlausibleEvent('CTA Booksy Click', {
                    placement: 'service-card',
                    serviceId: service.id,
                  })
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.stopPropagation()
                  }
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-action px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
              >
                <Calendar className="h-4 w-4" />
                Umów się
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
