import { iconActionStyles } from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { isSalonOpenNow } from '@libs/openingHours'
import { PhoneCall } from 'lucide-react'

export default function PhoneButton() {
  const renderTime = useRenderTime()
  const phoneNumber = primarySalonLocation.phone.replace(/\s+/g, '')
  const salonOpen = isSalonOpenNow(
    primarySalonLocation.openingSchedule,
    renderTime,
  )

  return (
    <a
      href={`tel:${phoneNumber}`}
      onClick={() => trackPlausibleEvent('Call CTA Click')}
      className={iconActionStyles({ className: 'relative' })}
      aria-label={`Zadzwoń pod numer ${primarySalonLocation.phone}${salonOpen ? ', gabinet jest teraz otwarty' : ''}`}
      title={`Zadzwoń pod numer ${primarySalonLocation.phone}`}
    >
      {salonOpen && (
        <span
          className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)] animate-pulse"
          aria-hidden="true"
        />
      )}
      <PhoneCall className="w-6 h-6" />
    </a>
  )
}
