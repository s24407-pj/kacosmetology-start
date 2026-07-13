import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libs/analytics', () => ({
  trackPlausibleEvent: vi.fn(),
}))

vi.mock('@libs/utils', async () => {
  const actual =
    await vi.importActual<typeof import('@libs/utils')>('@libs/utils')
  return {
    ...actual,
    scrollToTop: vi.fn(),
  }
})

import { trackPlausibleEvent } from '@libs/analytics'
import { scrollToTop } from '@libs/utils'
import ScrollToTopButton from './ScrollToTopButton'

describe('ScrollToTopButton', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers analytics tracking and scroll helper on click', async () => {
    const user = userEvent.setup()

    render(<ScrollToTopButton />)

    await user.click(screen.getByRole('button', { name: 'Przewiń na górę' }))

    expect(trackPlausibleEvent).toHaveBeenCalledWith('Scroll To Top Click')
    expect(scrollToTop).toHaveBeenCalled()
  })
})
