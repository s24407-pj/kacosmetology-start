import { actionLinkStyles, iconActionStyles } from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { primarySalonLocation } from '@data/business'
import {
  formatPromotionDeadline,
  getAllActivePromotions,
  getPromotionScopeDescription,
} from '@data/promotion'
import { useReducedMotion } from '@hooks/useReducedMotion'
import { trackPlausibleEvent } from '@libs/analytics'
import { Percent, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BANNER_CTA_LABEL = 'Zarezerwuj termin'
const BANNER_CTA_LABEL_COMPACT = 'Zarezerwuj'
const MARQUEE_PIXELS_PER_SECOND = 40

function PromotionBannerMessage({ message }: { message: string }) {
  const reducedMotion = useReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const shouldMarquee = isOverflowing && !reducedMotion

  useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) {
      return
    }

    const updateOverflow = () => {
      const segmentWidth = content.scrollWidth
      const availableWidth = viewport.clientWidth
      const overflowing = segmentWidth > availableWidth + 1
      setIsOverflowing(overflowing)
      setDurationSeconds(
        overflowing ? segmentWidth / MARQUEE_PIXELS_PER_SECOND : 0,
      )
    }

    updateOverflow()

    const observer = new ResizeObserver(updateOverflow)
    observer.observe(viewport)
    observer.observe(content)

    return () => observer.disconnect()
  }, [message, shouldMarquee])

  return (
    <div ref={viewportRef} className="relative min-w-0 flex-1 overflow-hidden">
      {shouldMarquee ? (
        <div
          className="animate-promotion-banner-marquee flex"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          <span
            ref={contentRef}
            className="shrink-0 whitespace-nowrap pr-8 font-semibold leading-tight"
          >
            {message}
          </span>
          <span
            className="shrink-0 whitespace-nowrap pr-8 font-semibold leading-tight"
            aria-hidden="true"
          >
            {message}
          </span>
        </div>
      ) : (
        <span
          ref={contentRef}
          className={`block whitespace-nowrap font-semibold leading-tight${
            isOverflowing ? ' truncate' : ''
          }`}
        >
          {message}
        </span>
      )}
    </div>
  )
}

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
              className="flex min-w-0 items-center gap-2 sm:gap-4"
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15 sm:h-6 sm:w-6">
                <Percent
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
              </span>
              <PromotionBannerMessage message={bannerMessage} />
              <a
                href={primarySalonLocation.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${BANNER_CTA_LABEL} w Booksy (otwiera nową kartę)`}
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
                    'shrink-0 whitespace-nowrap min-h-8 py-1.5 text-[11px] uppercase tracking-wide focus-visible:ring-white/70 focus-visible:ring-offset-action sm:min-h-9 sm:text-sm',
                })}
              >
                <span className="sm:hidden">{BANNER_CTA_LABEL_COMPACT}</span>
                <span className="hidden sm:inline">{BANNER_CTA_LABEL}</span>
              </a>
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
