import '@testing-library/jest-dom/vitest'
import { brand, primarySalonLocation } from '@data/business'
import { ConsentProvider } from '@libs/consent'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clickAnalyticsLink } from '@/test/clickAnalyticsLink'

vi.mock('@libs/analytics', () => ({
  analytics: {
    trackInitiateCheckout: vi.fn(),
    trackLead: vi.fn(),
    updateConsent: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

import { analytics } from '@libs/analytics'
import Footer from './Footer'

function renderFooter() {
  return render(
    <ConsentProvider>
      <Footer />
    </ConsentProvider>,
  )
}

describe('Footer', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders phone link with tracking', async () => {
    const user = userEvent.setup()
    renderFooter()

    const phoneLink = screen.getByRole('link', { name: 'Telefon' })
    expect(phoneLink).toHaveAttribute(
      'href',
      `tel:${primarySalonLocation.phone.replace(/\s+/g, '')}`,
    )

    await clickAnalyticsLink(user, phoneLink)
    expect(analytics.trackLead).toHaveBeenCalledWith({
      channel: 'phone',
      placement: 'footer',
    })
  })

  it('renders email link with tracking', async () => {
    const user = userEvent.setup()
    renderFooter()

    const emailLink = screen.getByRole('link', { name: 'Email' })
    expect(emailLink).toHaveAttribute('href', `mailto:${brand.email}`)

    await clickAnalyticsLink(user, emailLink)
    expect(analytics.trackLead).toHaveBeenCalledWith({
      channel: 'email',
      placement: 'footer',
    })
  })

  it('renders Instagram link with tracking', async () => {
    const user = userEvent.setup()
    renderFooter()

    const instagramLink = screen.getByRole('link', { name: 'Instagram' })
    expect(instagramLink).toHaveAttribute('href', brand.socialMedia.instagram)
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')

    await clickAnalyticsLink(user, instagramLink)
    expect(analytics.trackLead).toHaveBeenCalledWith({
      channel: 'instagram',
      placement: 'footer',
    })
  })

  it('renders Facebook link with tracking', async () => {
    if (!brand.socialMedia.facebook) {
      throw new Error('Expected facebook link in contact data for this test')
    }

    const user = userEvent.setup()
    renderFooter()

    const facebookLink = screen.getByRole('link', { name: 'Facebook' })
    expect(facebookLink).toHaveAttribute('href', brand.socialMedia.facebook)
    expect(facebookLink).toHaveAttribute('target', '_blank')
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')

    await clickAnalyticsLink(user, facebookLink)
    expect(analytics.trackLead).toHaveBeenCalledWith({
      channel: 'facebook',
      placement: 'footer',
    })
  })

  it('displays contact information', () => {
    renderFooter()

    expect(screen.getByText(primarySalonLocation.phone)).toBeInTheDocument()
    expect(screen.getByText(brand.email)).toBeInTheDocument()
    expect(screen.getByText(/ul\. Paderewskiego 11a/)).toBeInTheDocument()
    expect(
      screen.getByText(primarySalonLocation.address.locality, { exact: false }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `Profesjonalna kosmetologia i trychologia w ${primarySalonLocation.localityLocative}.`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Przejdź do rezerwacji/ }),
    ).toHaveAttribute('href', primarySalonLocation.bookingUrl)
  })

  it('displays copyright information and consent controls', () => {
    renderFooter()

    const year = new Date().getFullYear()
    expect(
      screen.getByText(
        new RegExp(`© ${year} ${brand.name}. Wszystkie prawa zastrzeżone.`),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Polityka prywatności' }),
    ).toHaveAttribute('href', '/polityka-prywatnosci')
    expect(
      screen.getByRole('button', { name: 'Zarządzaj cookies' }),
    ).toBeInTheDocument()
  })
})
