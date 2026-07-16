import type { ContactLinkType } from '@app-types/types'
import FacebookSVG from '@components/icons/FacebookSVG'
import InstagramSVG from '@components/icons/InstagramSVG'
import { Section, SectionHeader } from '@components/ui'
import { useRenderTime } from '@context/RenderTimeProvider'
import { contact, contactLinks } from '@data/contact'
import { trackPlausibleEvent } from '@libs/analytics'
import { getContactHref } from '@libs/contactLinks'
import {
  getCurrentOpeningSnapshot,
  isOpeningSlotActive,
} from '@libs/openingHours'
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
  return (
    <Section id="kontakt" background="contact" decorated="top">
      <SectionHeader
        title="Kontakt"
        eyebrow="Zapraszam"
        subtitle="Skontaktuj się ze mną, aby umówić wizytę."
        gradient
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 animate-on-scroll">
          <div className="rounded-lg border border-border-default bg-surface p-6 shadow-subtle sm:p-8">
            <h3 className="mb-6 font-display text-2xl font-bold text-text-primary">
              Informacje kontaktowe
            </h3>
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
                    {contact.address.street}
                    <br />
                    {contact.address.postalCode} {contact.address.city}
                  </p>
                </address>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={contact.booksy}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center rounded-md bg-action px-6 py-3 font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2"
              onClick={() =>
                trackPlausibleEvent('CTA Booksy Click', {
                  placement: CONTACT_SECTION_PLACEMENT,
                })
              }
            >
              <Heart className="mr-2 h-5 w-5" />
              Umów wizytę przez Booksy
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-border-default bg-surface p-6 shadow-subtle animate-on-scroll stagger-1 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center font-display text-2xl font-bold text-text-primary">
              <Clock className="mr-3 h-6 w-6 text-action" />
              Godziny otwarcia
            </h3>
          </div>
          <OpeningHoursList />
        </div>
      </div>
    </Section>
  )
}

function OpeningHoursList() {
  const renderTime = useRenderTime()
  const snapshot = getCurrentOpeningSnapshot(renderTime)
  const isOpenNow = Object.entries(contact.openingHours).some(([day, hours]) =>
    isOpeningSlotActive(hours, day, snapshot),
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
      {Object.entries(contact.openingHours).map(([day, hours]) => {
        const isToday = day.toLowerCase() === snapshot.currentDayName
        const isActive = isOpeningSlotActive(hours, day, snapshot)

        return (
          <div
            key={day}
            className="flex justify-between items-center py-3 border-b border-border-default last:border-b-0"
          >
            <span className="font-medium text-text-primary">{day}</span>
            <span
              className={`font-medium ${
                hours === 'Zamknięte'
                  ? 'text-text-muted'
                  : isToday
                    ? 'text-action'
                    : 'text-text-secondary'
              } ${isToday ? 'font-semibold' : ''}`.trim()}
              aria-current={isToday ? 'date' : undefined}
            >
              {hours}
              {isActive && (
                <span className="sr-only"> (gabinet jest teraz otwarty)</span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
