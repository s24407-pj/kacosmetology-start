import type { Service } from '@app-types/types'
import { useRenderTime } from '@context/RenderTimeProvider'
import { getServicePricing } from '@libs/servicePricing'

export function ServicePrice({ service }: { service: Service }) {
  const pricing = getServicePricing(service, useRenderTime())

  return (
    <section className="space-y-1" aria-label={`Cena usługi ${service.name}`}>
      <p className="font-display text-2xl font-bold text-action">
        {pricing.activePromotion ? (
          <>
            <span className="mr-2 text-base font-normal text-text-muted line-through">
              {pricing.standardPrice} zł
            </span>
            {pricing.currentPrice} zł
          </>
        ) : (
          `${pricing.standardPrice} zł`
        )}
      </p>
      {pricing.lowestPriceInLast30Days !== undefined ? (
        <p className="text-xs text-text-muted">
          Najniższa cena z 30 dni przed obniżką:{' '}
          {pricing.lowestPriceInLast30Days} zł
        </p>
      ) : null}
    </section>
  )
}
