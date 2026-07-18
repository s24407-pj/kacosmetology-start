import type { ContactLinkType } from '@app-types/types'
import FacebookSVG from '@components/icons/FacebookSVG'
import InstagramSVG from '@components/icons/InstagramSVG'
import KaCosmetologyLogo from '@components/icons/KaCosmetologyLogo'
import { Heading, iconActionStyles } from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { createContactLinks, getContactHref } from '@libs/contactLinks'
import BooksyLink from '@widgets/actions/BooksyLink'
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
            <p className="mt-5 max-w-xs font-body text-white/70">
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
                    className={iconActionStyles({ tone: 'inverse' })}
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
            <Heading
              level={2}
              variant="utility"
              tone="inverse"
              className="mb-4"
            >
              Kontakt
            </Heading>
            <div className="space-y-2 font-body text-sm text-white/70">
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
            <Heading
              level={2}
              variant="utility"
              tone="inverse"
              className="mb-4"
            >
              Umów wizytę
            </Heading>
            <p className="mb-4 font-body text-sm text-white/70">
              Zarezerwuj dogodny termin online przez Booksy.
            </p>
            <BooksyLink
              placement={FOOTER_PLACEMENT}
              showExternalIcon={false}
              className="min-h-11 px-6 py-3 text-sm"
            >
              Przejdź do rezerwacji
            </BooksyLink>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-white/65">
            © {currentYear} {brand.name}. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
