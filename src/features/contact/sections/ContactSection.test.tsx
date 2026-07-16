import '@testing-library/jest-dom/vitest'
import { contact } from '@data/contact'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { referenceTime } = vi.hoisted(() => ({
  referenceTime: new Date('2025-09-15T12:00:00.000Z'),
}))

vi.mock('@context/RenderTimeProvider', () => ({
  useRenderTime: () => referenceTime,
}))

vi.mock('@libs/openingHours', () => ({
  getCurrentOpeningSnapshot: vi.fn(() => ({
    currentDayName: 'poniedziałek',
    currentMinutes: 12 * 60,
  })),
  isOpeningSlotActive: vi.fn(() => false),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { trackPlausibleEvent } from '@libs/analytics'
import {
  getCurrentOpeningSnapshot,
  isOpeningSlotActive,
  type OpeningSnapshot,
} from '@libs/openingHours'
import ContactSection from './ContactSection'

const mockedGetCurrentOpeningSnapshot = vi.mocked(getCurrentOpeningSnapshot)
const mockedIsOpeningSlotActive = vi.mocked(isOpeningSlotActive)

describe('ContactSection', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetCurrentOpeningSnapshot.mockReturnValue({
      currentDayName: 'poniedziałek',
      currentMinutes: 12 * 60,
    })
    mockedIsOpeningSlotActive.mockReturnValue(false)
  })

  it('renders contact section heading', () => {
    render(<ContactSection />)
    expect(screen.getByText('Kontakt')).toBeInTheDocument()
  })

  it('renders phone contact with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const phoneLink = screen.getByRole('link', { name: contact.phone })
    expect(phoneLink).toHaveAttribute(
      'href',
      `tel:${contact.phone.replace(/\s+/g, '')}`,
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

    const emailLink = screen.getByRole('link', { name: contact.email })
    expect(emailLink).toHaveAttribute('href', `mailto:${contact.email}`)

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

  it('renders Instagram link with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const instagramLink = screen.getByRole('link', {
      name: /@ka\.cosmetology/i,
    })
    expect(instagramLink).toHaveAttribute('href', contact.socialMedia.instagram)
    expect(instagramLink).toHaveAttribute('target', '_blank')

    await user.click(instagramLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'instagram',
      placement: 'contact-section',
    })
  })

  it('renders Facebook link with tracking', async () => {
    if (!contact.socialMedia.facebook) {
      throw new Error('Expected facebook link in contact data for this test')
    }

    const user = userEvent.setup()
    render(<ContactSection />)

    const facebookLink = screen.getByRole('link', { name: /^Ka\.Cosmetology$/ })
    expect(facebookLink).toHaveAttribute('href', contact.socialMedia.facebook)
    expect(facebookLink).toHaveAttribute('target', '_blank')

    await user.click(facebookLink)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Contact Action Click', {
      channel: 'facebook',
      placement: 'contact-section',
    })
  })

  it('renders Booksy CTA button with tracking', async () => {
    const user = userEvent.setup()
    render(<ContactSection />)

    const booksyButton = screen.getByRole('link', {
      name: /umów wizytę przez booksy/i,
    })
    expect(booksyButton).toHaveAttribute('href', contact.booksy)
    expect(booksyButton).toHaveAttribute('target', '_blank')

    await user.click(booksyButton)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('CTA Booksy Click', {
      placement: 'contact-section',
    })
  })

  it('marks current day in opening hours list', () => {
    const snapshot: OpeningSnapshot = {
      currentDayName: 'poniedziałek',
      currentMinutes: 12 * 60,
    }
    mockedGetCurrentOpeningSnapshot.mockReturnValue(snapshot)

    render(<ContactSection />)

    const mondayRow = screen.getByText('poniedziałek').closest('div')
    expect(mondayRow).toBeInTheDocument()

    const activeDayHours = within(mondayRow!).getByText('09:00 - 17:00', {
      selector: 'span',
    })
    expect(activeDayHours).toHaveAttribute('aria-current', 'date')
  })

  it('derives opening hours from the canonical render time', () => {
    render(<ContactSection />)

    expect(mockedGetCurrentOpeningSnapshot).toHaveBeenCalledWith(referenceTime)
  })

  it('announces currently open state for assistive technologies', () => {
    const snapshot: OpeningSnapshot = {
      currentDayName: 'poniedziałek',
      currentMinutes: 12 * 60,
    }
    mockedGetCurrentOpeningSnapshot.mockReturnValue(snapshot)
    mockedIsOpeningSlotActive.mockImplementation(
      (hours, day, currentSnapshot) => {
        return (
          day.toLowerCase() === currentSnapshot.currentDayName &&
          hours === '09:00 - 17:00' &&
          currentSnapshot.currentMinutes === 12 * 60
        )
      },
    )

    render(<ContactSection />)

    expect(screen.getByText('(gabinet jest teraz otwarty)')).toBeInTheDocument()
  })
})
