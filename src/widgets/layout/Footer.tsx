import type { ContactLinkType } from '@app-types/types'
import FacebookSVG from '@components/icons/FacebookSVG'
import InstagramSVG from '@components/icons/InstagramSVG'
import KaCosmetologyLogo from '@components/icons/KaCosmetologyLogo'
import { useRenderTime } from '@context/RenderTimeProvider'
import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { createContactLinks, getContactHref } from '@libs/contactLinks'
import { Mail, Phone } from 'lucide-react'
import type { ComponentType } from 'react'

const FOOTER_PLACEMENT = 'footer'

type FooterIcon = ComponentType<{ className?: string }>

const FOOTER_LINK_ICONS: Record<ContactLinkType, FooterIcon> = {
  phone: Phone,
  email: Mail,
  instagram: InstagramSVG,
  facebook: FacebookSVG,
}

const trackFooterContactClick = (channel: ContactLinkType) => {
  trackPlausibleEvent('Contact Action Click', {
    channel,
    placement: FOOTER_PLACEMENT,
  })
}

export default function Footer() {
  const currentYear = useRenderTime().getFullYear()
  const contactLinks = createContactLinks(brand, primarySalonLocation)

  return (
    <footer className="relative overflow-hidden bg-text-primary text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-action"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <KaCosmetologyLogo className="w-32 text-white" />
            <p className="mt-5 max-w-xs font-body text-gray-400">
              Profesjonalna kosmetologia i trychologia w{' '}
              {primarySalonLocation.localityLocative}.
            </p>
            <div className="mt-6 flex gap-3">
              {contactLinks.map((link) => {
                const Icon = FOOTER_LINK_ICONS[link.type]

                return (
                  <a
                    key={link.type}
                    href={getContactHref(link.type, link.value)}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-gray-300 transition-colors hover:bg-action hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/50"
                    aria-label={link.label}
                    onClick={() => trackFooterContactClick(link.type)}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">
              Kontakt
            </h2>
            <div className="space-y-2 font-body text-sm text-gray-400">
              <p>{primarySalonLocation.phone}</p>
              <p>{brand.email}</p>
              <p>
                {primarySalonLocation.address.streetAddress},{' '}
                {primarySalonLocation.address.postalCode}{' '}
                {primarySalonLocation.address.locality}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">
              Umów wizytę
            </h2>
            <p className="mb-4 font-body text-sm text-gray-400">
              Zarezerwuj dogodny termin online przez Booksy.
            </p>
            <a
              href={primarySalonLocation.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-md bg-action px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/50"
              onClick={() =>
                trackPlausibleEvent('CTA Booksy Click', {
                  placement: FOOTER_PLACEMENT,
                })
              }
            >
              Umów się
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} {brand.name}. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
