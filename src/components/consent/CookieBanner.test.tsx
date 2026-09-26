import '@testing-library/jest-dom/vitest'
import { ConsentProvider } from '@libs/consent'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieBanner } from './CookieBanner'

const updateConsent = vi.fn()

vi.mock('@libs/analytics', () => ({
  analytics: {
    updateConsent: (...args: unknown[]) => updateConsent(...args),
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

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    updateConsent.mockReset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('shows equal-weight accept before reject after hydration', async () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Zaakceptuj wszystkie' }),
      ).toBeInTheDocument()
    })

    const accept = screen.getByRole('button', { name: 'Zaakceptuj wszystkie' })
    const reject = screen.getByRole('button', { name: 'Odrzuć opcjonalne' })

    expect(accept.className).toEqual(reject.className)
    expect(accept.compareDocumentPosition(reject)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(
      screen.getByRole('link', { name: 'Polityce prywatności' }),
    ).toHaveAttribute('href', '/polityka-prywatnosci')
  })

  it('keeps the first-layer banner non-blocking so content stays browsable', async () => {
    render(
      <ConsentProvider>
        <main>
          <a href="/oferta">Oferta zabiegów</a>
        </main>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('region', {
          name: 'Zarządzanie zgodami na pliki cookies',
        }),
      ).toBeInTheDocument()
    })

    expect(document.body.style.overflow).not.toBe('hidden')
    expect(
      screen.queryByRole('button', { name: 'Zamknij tło ustawień cookies' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Oferta zabiegów' })).toBeVisible()
  })

  it('opens preferences with optional categories unchecked and necessary locked on', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))
    expect(
      screen.getByRole('dialog', { name: 'Ustawienia cookies' }),
    ).toBeInTheDocument()

    const necessary = screen.getByRole('switch', { name: 'Niezbędne' })
    const analytics = screen.getByRole('switch', { name: 'Analityczne' })
    const marketing = screen.getByRole('switch', { name: 'Marketingowe' })

    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()
    expect(analytics).not.toBeChecked()
    expect(marketing).not.toBeChecked()
    expect(analytics).toBeEnabled()
    expect(marketing).toBeEnabled()
  })

  it('opens preferences and saves custom choices', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))
    expect(
      screen.getByRole('dialog', { name: 'Ustawienia cookies' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Analityczne' }))
    await user.click(screen.getByRole('button', { name: 'Zapisz wybrane' }))

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: false,
    })
  })

  it('exposes equal-weight accept and reject shortcuts in preferences', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))

    const dialog = screen.getByRole('dialog', { name: 'Ustawienia cookies' })
    const accept = screen.getByRole('button', { name: 'Zaakceptuj wszystkie' })
    const reject = screen.getByRole('button', { name: 'Odrzuć opcjonalne' })

    expect(dialog).toContainElement(accept)
    expect(dialog).toContainElement(reject)
    expect(accept.className).toEqual(reject.className)

    await user.click(accept)

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: true,
    })
  })

  it('toggles marketing in preferences and closes on Escape', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))
    await user.click(screen.getByRole('switch', { name: 'Marketingowe' }))
    expect(screen.getByRole('switch', { name: 'Marketingowe' })).toBeChecked()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Ustawienia cookies' }),
      ).not.toBeInTheDocument()
    })
  })

  it('traps Tab focus inside the preferences dialog', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))

    const dialog = screen.getByRole('dialog', { name: 'Ustawienia cookies' })
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    expect(first).toBeTruthy()
    expect(last).toBeTruthy()

    last.focus()
    await user.tab()
    expect(document.activeElement).toBe(first)

    first.focus()
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(last)
  })
})
