import '@testing-library/jest-dom/vitest'
import { brand, primarySalonLocation } from '@data/business'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { trackPlausibleEvent } from '@libs/analytics'
import Footer from './Footer'

describe('Footer', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders phone link with tracking', async () => {
    const user = userEvent.setup()
    render(<Footer />)

    const phoneLink = screen.getByRole('link', { name: 'Telefon' })
    expect(phoneLink).toHaveAttribute(
      'href',
      `tel:${primarySalonLocation.phone.replace(/\s+/g, '')}`,
    )

    await user.click(phoneLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'phone',
      placement: 'footer',
    })
  })

  it('renders email link with tracking', async () => {
    const user = userEvent.setup()
    render(<Footer />)

    const emailLink = screen.getByRole('link', { name: 'Email' })
    expect(emailLink).toHaveAttribute('href', `mailto:${brand.email}`)

    await user.click(emailLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'email',
      placement: 'footer',
    })
  })

  it('renders Instagram link with tracking', async () => {
    const user = userEvent.setup()
    render(<Footer />)

    const instagramLink = screen.getByRole('link', { name: 'Instagram' })
    expect(instagramLink).toHaveAttribute('href', brand.socialMedia.instagram)
    expect(instagramLink).toHaveAttribute('target', '_blank')

    await user.click(instagramLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'instagram',
      placement: 'footer',
    })
  })

  it('renders Facebook link with tracking', async () => {
    if (!brand.socialMedia.facebook) {
      throw new Error('Expected facebook link in contact data for this test')
    }

    const user = userEvent.setup()
    render(<Footer />)

    const facebookLink = screen.getByRole('link', { name: 'Facebook' })
    expect(facebookLink).toHaveAttribute('href', brand.socialMedia.facebook)
    expect(facebookLink).toHaveAttribute('target', '_blank')

    await user.click(facebookLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'facebook',
      placement: 'footer',
    })
  })

  it('displays contact information', () => {
    render(<Footer />)

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

  it('displays copyright information', () => {
    render(<Footer />)

    const year = new Date().getFullYear()
    expect(
      screen.getByText(
        new RegExp(`© ${year} ${brand.name}. Wszystkie prawa zastrzeżone.`),
      ),
    ).toBeInTheDocument()
  })
})
