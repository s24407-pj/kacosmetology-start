import { useRenderTime } from '@context/RenderTimeProvider'
import { primarySalonLocation } from '@data/business'
import {
  formatPromotionDeadline,
  getAllActivePromotions,
  getPromotionScopeDescription,
} from '@data/promotion'
import { trackPlausibleEvent } from '@libs/analytics'
import { Percent, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const AUTO_DISMISS_DURATION = 8000

export default function PromotionBanner() {
  const renderTime = useRenderTime()
  const activePromotions = getAllActivePromotions(renderTime)
  const hasActivePromotions = activePromotions.length > 0
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!hasActivePromotions || isDismissed) return

    const timer = setTimeout(() => {
      setIsDismissed(true)
    }, AUTO_DISMISS_DURATION)

    return () => clearTimeout(timer)
  }, [hasActivePromotions, isDismissed])

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
                  className="inline-flex min-h-8 items-center justify-center rounded-md bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-action transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-action sm:min-h-9 sm:text-sm"
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
        className="absolute right-2 top-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center cursor-pointer rounded-md text-white transition-colors duration-200 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-action sm:right-4 group"
        aria-label="Zamknij baner promocji"
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none p-1">
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-30"
          />
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="100"
            pathLength="100"
            className="animate-shrink-spinner"
            style={{ animationDuration: `${AUTO_DISMISS_DURATION}ms` }}
          />
        </svg>
        <X
          className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4"
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
