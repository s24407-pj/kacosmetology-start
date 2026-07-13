import type { ActivePromotion } from '@data/promotion'
import { useSectionNavigation } from '@hooks/useSectionNavigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { Gift, Percent } from 'lucide-react'
import type { MouseEvent } from 'react'

interface VoucherCardProps {
  onCTAClick?: () => void
}

export function VoucherCard({ onCTAClick }: VoucherCardProps) {
  const navigateToSection = useSectionNavigation()
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    trackPlausibleEvent('Voucher CTA Click', {
      placement: 'services-section',
    })
    onCTAClick?.()
    void navigateToSection('kontakt')
  }

  return (
    <div className="animate-on-scroll animate-fade-up md:col-span-2 lg:col-span-3">
      <div className="relative overflow-hidden rounded-lg border border-action bg-action p-6 text-white sm:p-8">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="rounded-md bg-white/15 p-3">
              <Gift className="h-7 w-7 text-white" />
            </span>
            <div>
              <h3 className="text-2xl font-semibold font-display">
                Vouchery prezentowe
              </h3>
              <p className="text-sm sm:text-base text-white/80 font-body">
                Podaruj bliskiej osobie czas na ukochane rytuały pielęgnacyjne.
                Vouchery przygotowuję stacjonarnie w gabinecie – wybierasz kwotę
                lub konkretny zabieg, a resztą zajmę się ja.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm sm:text-base text-white/90">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-white/70" />
              Możliwość dopasowania wartości voucheru do Twojego budżetu.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-white/70" />
              Opcja wpisania dedykacji oraz wyboru konkretnego zabiegu z oferty.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-white/70" />
              Odbiór na miejscu po wcześniejszym kontakcie telefonicznym lub
              przez Booksy.
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#kontakt"
              onClick={handleClick}
              className="inline-flex min-h-11 items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-action transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-action"
            >
              Zapytaj o voucher
            </a>
            <p className="text-xs sm:text-sm text-white/70">
              Vouchery są ważne rok od daty zakupu.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PromotionBannerCardProps {
  promotion: ActivePromotion
  scopeDescription: string
  deadline: string
}

export function PromotionBannerCard({
  promotion,
  scopeDescription,
  deadline,
}: PromotionBannerCardProps) {
  return (
    <div className="animate-on-scroll animate-fade-up md:col-span-2 lg:col-span-3">
      <div className="relative overflow-hidden rounded-lg border border-action bg-action p-6 text-white sm:p-8">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span className="rounded-md bg-white/15 p-3">
              <Percent className="h-7 w-7 text-white" />
            </span>
            <div>
              <h3 className="text-2xl font-semibold font-display">
                Aktualna promocja
              </h3>
              <p className="text-sm sm:text-base text-white/80 font-body">
                -{promotion.discountPercentage.toFixed(0)}% na{' '}
                {scopeDescription} {deadline}.
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-white/80 font-body">
            Wybierz poniżej zabieg objęty promocją i umów termin, zanim oferta
            wygaśnie.
          </p>
        </div>
      </div>
    </div>
  )
}
