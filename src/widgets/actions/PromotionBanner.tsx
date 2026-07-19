import { actionLinkStyles, iconActionStyles } from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { primarySalonLocation } from '@data/business'
import {
  formatPromotionDeadline,
  getAllActivePromotions,
  getPromotionScopeDescription,
} from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import { Percent, X } from 'lucide-react'
import { useState } from 'react'

export default function PromotionBanner() {
  const renderTime = useRenderTime()
  const activePromotions = getAllActivePromotions(renderTime)
  const hasActivePromotions = activePromotions.length > 0
  const [isDismissed, setIsDismissed] = useState(false)

  if (!hasActivePromotions || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)

    for (const promotion of activePromotions) {
      trackPlausibleEvent('Promotion Banner Dismissed', {
        placement: 'promotion-banner',
        promotionId: promotion.id,
      })
    }
  }

  return (
    <div
      className="relative border-b border-action-hover bg-action text-white"
      role="status"
      aria-live="polite"
      aria-label="Aktywna promocja"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 pr-11 text-sm sm:gap-3 sm:px-6 sm:pr-16 sm:text-base lg:px-8">
        {activePromotions.map((promotion) => {
          const bannerMessage = `Promocja! - ${getPromotionScopeDescription(promotion)} ${formatPromotionDeadline(promotion)}.`

          return (
            <div
              key={promotion.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            >
              <div className="min-w-0 flex items-start gap-2 text-left sm:items-center sm:text-center">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15 sm:mt-0 sm:h-6 sm:w-6">
                  <Percent
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    aria-hidden="true"
                  />
                </span>
                <span className="font-semibold leading-tight sm:leading-normal">
                  {bannerMessage}
                </span>
              </div>
              <div className="flex items-center pr-1 sm:pr-0">
                <a
                  href={primarySalonLocation.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${promotion.ctaLabel} w Booksy (otwiera nową kartę)`}
                  onClick={() =>
                    trackPlausibleEvent('CTA Booksy Click', {
                      placement: 'promotion-banner',
                      promotionId: promotion.id,
                    })
                  }
                  className={actionLinkStyles({
                    variant: 'inverse',
                    size: 'xs',
                    className:
                      'min-h-8 py-1.5 text-[11px] uppercase tracking-wide focus-visible:ring-white/70 focus-visible:ring-offset-action sm:min-h-9 sm:text-sm',
                  })}
                >
                  {promotion.ctaLabel}
                </a>
              </div>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className={iconActionStyles({
          tone: 'inverse',
          size: 'sm',
          className:
            'group absolute right-2 top-2 h-8 w-8 cursor-pointer focus-visible:ring-white/70 focus-visible:ring-offset-action sm:right-4 sm:h-9 sm:w-9',
        })}
        aria-label="Zamknij baner promocji"
      >
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
