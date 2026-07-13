import { useRenderTime } from '@context/RenderTimeProvider'
import { contact } from '@data/contact'
import { trackPlausibleEvent } from '@libs/analytics'
import { isSalonOpenNow } from '@libs/openingHours'
import { PhoneCall } from 'lucide-react'

export default function PhoneButton() {
  const renderTime = useRenderTime()
  const phoneNumber = contact.phone.replace(/\s+/g, '')
  const salonOpen = isSalonOpenNow(contact.openingHours, renderTime)

  return (
    <a
      href={`tel:${phoneNumber}`}
      onClick={() => trackPlausibleEvent('Call CTA Click')}
      className="relative text-text-secondary hover:text-action transition-colors p-2 hover:bg-surface-muted rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label={`Zadzwoń pod numer ${contact.phone}${salonOpen ? ', gabinet jest teraz otwarty' : ''}`}
      title={`Zadzwoń pod numer ${contact.phone}`}
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
