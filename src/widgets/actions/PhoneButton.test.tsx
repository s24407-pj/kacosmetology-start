import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { referenceTime } = vi.hoisted(() => ({
  referenceTime: new Date('2025-09-15T12:00:00.000Z'),
}))

vi.mock('@context/RenderTimeProvider', () => ({
  useRenderTime: () => referenceTime,
}))

vi.mock('@libs/openingHours', () => ({
  isSalonOpenNow: vi.fn(),
}))

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

import { contact } from '@data/contact'
import { trackPlausibleEvent } from '@libs/analytics'
import { isSalonOpenNow } from '@libs/openingHours'
import PhoneButton from './PhoneButton'

const isSalonOpenNowMock = vi.mocked(isSalonOpenNow)

describe('PhoneButton', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes the phone link and augments the label when the salon is open', async () => {
    isSalonOpenNowMock.mockReturnValue(true)
    const user = userEvent.setup()

    render(<PhoneButton />)

    const link = screen.getByRole('link', {
      name: 'Zadzwoń pod numer +48 726 154 460, gabinet jest teraz otwarty',
    })
    expect(link).toHaveAttribute('href', 'tel:+48726154460')
    expect(isSalonOpenNowMock).toHaveBeenCalledWith(
      contact.openingHours,
      referenceTime,
    )

    await user.click(link)
    expect(trackPlausibleEvent).toHaveBeenCalledWith('Call CTA Click')
  })

  it('omits the open indicator when the salon is closed', () => {
    isSalonOpenNowMock.mockReturnValue(false)

    render(<PhoneButton />)

    const link = screen.getByRole('link', {
      name: 'Zadzwoń pod numer +48 726 154 460',
    })
    expect(link).not.toHaveAccessibleName(/gabinet jest teraz otwarty/)
  })
})
