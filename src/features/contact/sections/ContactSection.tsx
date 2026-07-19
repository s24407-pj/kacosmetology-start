import type { ContactLinkType } from '@app-types/types'
import FacebookSVG from '@components/icons/FacebookSVG'
import InstagramSVG from '@components/icons/InstagramSVG'
import {
  Heading,
  Section,
  SectionHeader,
  surfaceCardStyles,
} from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { brand, primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { createContactLinks, getContactHref } from '@libs/contactLinks'
import { getOpeningHoursView } from '@libs/openingHours'
import BooksyLink from '@widgets/actions/BooksyLink'
import { Clock, Heart, Mail, MapPin, Phone } from 'lucide-react'
import type { ComponentType } from 'react'

const CONTACT_SECTION_PLACEMENT = 'contact-section'

const trackContactActionClick = (channel: ContactLinkType) => {
  trackPlausibleEvent('Contact Action Click', {
    channel,
    placement: CONTACT_SECTION_PLACEMENT,
  })
}

type ContactIcon = ComponentType<{ className?: string }>

const CONTACT_LINK_ICONS: Record<ContactLinkType, ContactIcon> = {
  phone: Phone,
  email: Mail,
  instagram: InstagramSVG,
  facebook: FacebookSVG,
}

export default function ContactSection() {
  const contactLinks = createContactLinks(brand, primarySalonLocation)

  return (
    <Section id="kontakt" background="contact" decorated="top">
      <SectionHeader
        title="Kontakt"
        eyebrow="Zapraszam"
        subtitle="Skontaktuj się ze mną, aby umówić wizytę."
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div
            id="voucher"
            className={surfaceCardStyles({
              className: 'scroll-mt-48 p-6 sm:p-8',
            })}
          >
            <Heading level={3} variant="card" className="mb-6">
              Informacje kontaktowe
            </Heading>
            <div className="space-y-5">
              {contactLinks.map((link) => {
                const Icon = CONTACT_LINK_ICONS[link.type]

                return (
                  <div
                    key={link.type}
                    className="group flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-surface-muted"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-action">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {link.label}
                      </p>
                      <a
                        href={getContactHref(link.type, link.value)}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-action underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
                        onClick={() => trackContactActionClick(link.type)}
                      >
                        {link.text}
                      </a>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center gap-4 rounded-md p-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-action">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <address className="not-italic">
                  <p className="font-medium text-text-primary">Adres</p>
                  <p className="text-text-secondary">
                    {primarySalonLocation.address.streetAddress}
                    <br />
                    {primarySalonLocation.address.postalCode}{' '}
                    {primarySalonLocation.address.locality}
                  </p>
                </address>
              </div>
            </div>
            <p className="mt-6 border-t border-border-default pt-5 text-sm leading-relaxed text-text-secondary">
              Voucher możesz zamówić stacjonarnie lub telefonicznie.
            </p>
          </div>

          <div className="text-center">
            <BooksyLink
              placement={CONTACT_SECTION_PLACEMENT}
              showExternalIcon={false}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              Umów wizytę przez Booksy
            </BooksyLink>
          </div>
        </div>

        <div
          className={surfaceCardStyles({
            className: 'p-6 sm:p-8',
          })}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Heading level={3} variant="card" className="flex items-center">
              <Clock className="mr-3 h-6 w-6 text-action" />
              Godziny otwarcia
            </Heading>
          </div>
          <OpeningHoursList />
        </div>
      </div>
    </Section>
  )
}

function OpeningHoursList() {
  const renderTime = useRenderTime()
  const { isOpenNow, rows } = getOpeningHoursView(
    primarySalonLocation.openingSchedule,
    renderTime,
  )

  return (
    <div className="space-y-4">
      <div
        className={`mb-2 inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-semibold ${
          isOpenNow
            ? 'bg-success-500/10 text-success-500'
            : 'bg-surface-muted text-text-muted'
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${isOpenNow ? 'bg-success-500' : 'bg-text-muted'}`}
          aria-hidden="true"
        />
        {isOpenNow ? 'Otwarte teraz' : 'Obecnie zamknięte'}
      </div>
      {rows.map(
        ({ weekday, label, hoursText, isClosed, isToday, isActive }) => {
          return (
            <div
              key={weekday}
              className="flex justify-between items-center py-3 border-b border-border-default last:border-b-0"
            >
              <span className="font-medium text-text-primary">{label}</span>
              <span
                className={`font-medium ${
                  isClosed
                    ? 'text-text-muted'
                    : isToday
                      ? 'text-action'
                      : 'text-text-secondary'
                } ${isToday ? 'font-semibold' : ''}`.trim()}
                aria-current={isToday ? 'date' : undefined}
              >
                {hoursText}
                {isActive && (
                  <span className="sr-only"> (gabinet jest teraz otwarty)</span>
                )}
              </span>
            </div>
          )
        },
      )}
    </div>
  )
}
