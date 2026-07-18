import '@testing-library/jest-dom/vitest'
import { brand, primarySalonLocation } from '@data/business'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { referenceTime } = vi.hoisted(() => ({
  referenceTime: new Date('2025-09-15T12:00:00.000Z'),
}))

vi.mock('@context/RenderTimeProvider', () => ({
  useRenderTime: () => referenceTime,
}))

vi.mock('@libs/openingHours', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@libs/openingHours')>()),
  getOpeningHoursView: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { trackPlausibleEvent } from '@libs/analytics'
import { getOpeningHoursView } from '@libs/openingHours'
import ContactSection from './ContactSection'

const mockedGetOpeningHoursView = vi.mocked(getOpeningHoursView)
const openingHoursRows = [
  {
    weekday: 'monday' as const,
    label: 'poniedziałek',
    hoursText: '09:00 - 17:00',
    isClosed: false,
    isToday: true,
    isActive: false,
  },
  {
    weekday: 'tuesday' as const,
    label: 'wtorek',
    hoursText: '09:00 - 17:00',
    isClosed: false,
    isToday: false,
    isActive: false,
  },
  {
    weekday: 'wednesday' as const,
    label: 'środa',
    hoursText: '09:00 - 17:00',
    isClosed: false,
    isToday: false,
    isActive: false,
  },
  {
    weekday: 'thursday' as const,
    label: 'czwartek',
    hoursText: '10:00 - 18:00',
    isClosed: false,
    isToday: false,
    isActive: false,
  },
  {
    weekday: 'friday' as const,
    label: 'piątek',
    hoursText: '10:00 - 18:00',
    isClosed: false,
    isToday: false,
    isActive: false,
  },
  {
    weekday: 'saturday' as const,
    label: 'sobota',
    hoursText: '09:00 - 14:00',
    isClosed: false,
    isToday: false,
    isActive: false,
  },
  {
    weekday: 'sunday' as const,
    label: 'niedziela',
    hoursText: 'Zamknięte',
    isClosed: true,
    isToday: false,
    isActive: false,
  },
]

describe('ContactSection', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetOpeningHoursView.mockReturnValue({
      isOpenNow: false,
      rows: openingHoursRows,
    })
  })

  it('renders contact section heading', () => {
    render(<ContactSection />)
    expect(screen.getByText('Kontakt')).toBeInTheDocument()
  })

  it('renders phone contact with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const phoneLink = screen.getByRole('link', {
      name: primarySalonLocation.phone,
    })
    expect(phoneLink).toHaveAttribute(
      'href',
      `tel:${primarySalonLocation.phone.replace(/\s+/g, '')}`,
    )

    await user.click(phoneLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'phone',
      placement: 'contact-section',
    })
  })

  it('renders email contact with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const emailLink = screen.getByRole('link', { name: brand.email })
    expect(emailLink).toHaveAttribute('href', `mailto:${brand.email}`)

    await user.click(emailLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'email',
      placement: 'contact-section',
    })
  })

  it('renders address information', () => {
    render(<ContactSection />)
    expect(screen.getByText(/ul\. Paderewskiego 11a/)).toBeInTheDocument()
    expect(screen.getByText(/83-200/)).toBeInTheDocument()
    expect(screen.getByText(/Starogard Gdański/)).toBeInTheDocument()
  })

  it('pins the current contact facts and destinations', () => {
    render(<ContactSection />)

    expect(
      screen.getByRole('link', { name: primarySalonLocation.phone }),
    ).toHaveAttribute(
      'href',
      `tel:${primarySalonLocation.phone.replace(/\s+/g, '')}`,
    )
    expect(screen.getByRole('link', { name: brand.email })).toHaveAttribute(
      'href',
      `mailto:${brand.email}`,
    )
    expect(
      screen.getByText(
        new RegExp(
          primarySalonLocation.address.streetAddress.replace('.', '\\.'),
        ),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        new RegExp(
          `${primarySalonLocation.address.postalCode} ${primarySalonLocation.address.locality}`,
        ),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /umów wizytę w booksy/i }),
    ).toHaveAttribute('href', primarySalonLocation.bookingUrl)
  })

  it('explains how to order a voucher', () => {
    render(<ContactSection />)

    expect(
      screen.getByText(
        'Voucher możesz zamówić stacjonarnie lub telefonicznie.',
      ),
    ).toBeInTheDocument()
  })

  it('renders Instagram link with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const instagramLink = screen.getByRole('link', {
      name: /@ka\.cosmetology/i,
    })
    expect(instagramLink).toHaveAttribute('href', brand.socialMedia.instagram)
    expect(instagramLink).toHaveAttribute('target', '_blank')

    await user.click(instagramLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'instagram',
      placement: 'contact-section',
    })
  })

  it('renders Facebook link with tracking', async () => {
    if (!brand.socialMedia.facebook) {
      throw new Error('Expected facebook link in contact data for this test')
    }

    const user = userEvent.setup()
    render(<ContactSection />)

    const facebookLink = screen.getByRole('link', { name: /^Ka\.Cosmetology$/ })
    expect(facebookLink).toHaveAttribute('href', brand.socialMedia.facebook)
    expect(facebookLink).toHaveAttribute('target', '_blank')

    await user.click(facebookLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'facebook',
      placement: 'contact-section',
    })
  })

  it('renders external Booksy CTA with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const booksyButton = screen.getByRole('link', {
      name: /umów wizytę w booksy/i,
    })
    expect(booksyButton).toHaveAttribute(
      'href',
      primarySalonLocation.bookingUrl,
    )
    expect(booksyButton).toHaveAttribute('target', '_blank')

    await user.click(booksyButton)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'contact-section',
    })
  })

  it('marks current day in opening hours list', () => {
    render(<ContactSection />)

    const mondayRow = screen.getByText('poniedziałek').closest('div')
    expect(mondayRow).toBeInTheDocument()

    const activeDayHours = within(mondayRow!).getByText('09:00 - 17:00', {
      selector: 'span',
    })
    expect(activeDayHours).toHaveAttribute('aria-current', 'date')
  })

  it('renders the exact current opening-hours rows in weekday order', () => {
    render(<ContactSection />)

    const expectedRows = [
      ['poniedziałek', '09:00 - 17:00'],
      ['wtorek', '09:00 - 17:00'],
      ['środa', '09:00 - 17:00'],
      ['czwartek', '10:00 - 18:00'],
      ['piątek', '10:00 - 18:00'],
      ['sobota', '09:00 - 14:00'],
      ['niedziela', 'Zamknięte'],
    ]
    const openingHoursCard = screen
      .getByText('Godziny otwarcia')
      .closest('div.animate-on-scroll')
    expect(openingHoursCard).toBeInTheDocument()

    const renderedRows = Array.from(
      openingHoursCard!.querySelectorAll(
        '.space-y-4 > div.flex.justify-between',
      ),
      (row) => Array.from(row.children, (cell) => cell.textContent?.trim()),
    )

    expect(renderedRows).toEqual(expectedRows)
  })

  it('shows the current overall open and closed badge copy', () => {
    mockedGetOpeningHoursView.mockReturnValue({
      isOpenNow: true,
      rows: openingHoursRows,
    })
    const { rerender } = render(<ContactSection />)

    expect(screen.getByText('Otwarte teraz')).toBeVisible()

    mockedGetOpeningHoursView.mockReturnValue({
      isOpenNow: false,
      rows: openingHoursRows,
    })
    rerender(<ContactSection />)

    expect(screen.getByText('Obecnie zamknięte')).toBeVisible()
  })

  it('derives opening hours from the canonical render time', () => {
    render(<ContactSection />)

    expect(mockedGetOpeningHoursView).toHaveBeenCalledWith(
      primarySalonLocation.openingSchedule,
      referenceTime,
    )
  })

  it('announces currently open state for assistive technologies', () => {
    mockedGetOpeningHoursView.mockReturnValue({
      isOpenNow: true,
      rows: openingHoursRows.map((row) => ({
        ...row,
        isActive: row.weekday === 'monday',
      })),
    })

    render(<ContactSection />)

    expect(screen.getByText('(gabinet jest teraz otwarty)')).toBeInTheDocument()
  })
})
